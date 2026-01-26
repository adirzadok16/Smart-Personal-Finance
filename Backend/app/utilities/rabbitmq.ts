import amqp, { Channel, ChannelModel, ConsumeMessage } from 'amqplib';

export class RabbitMQService {
    private static connection: ChannelModel;
    private static channel: Channel;

    private static readonly RABBIT_URL =
        process.env.RABBIT_URL || 'amqp://localhost';

    // ======================
    // CONNECT
    // ======================
    static async connect() {
        if (this.channel) return;

        this.connection = await amqp.connect(this.RABBIT_URL);
        this.channel = await this.connection.createChannel();

        console.log('✅ RabbitMQ connected');
    }

    // ======================
    // EXCHANGE
    // ======================
    static async assertExchange(
        exchange: string,
        type: 'topic' | 'direct' | 'fanout' = 'topic'
    ) {
        await this.channel.assertExchange(exchange, type, { durable: true });
    }

    // ======================
    // PUBLISH
    // ======================
    static publish(
        exchange: string,
        routingKey: string,
        message: object
    ): void {
        if (!this.channel) {
            throw new Error('RabbitMQ not connected');
        }

        this.channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );
    }

    // ======================
    // SUBSCRIBE
    // ======================
    static async subscribe(
        exchange: string,
        queue: string,
        routingKeys: string[],
        onMessage: (data: any) => Promise<void>
    ) {
        await this.channel.assertQueue(queue, { durable: true });

        for (const key of routingKeys) {
            await this.channel.bindQueue(queue, exchange, key);
        }

        await this.channel.consume(queue, async (msg: ConsumeMessage | null) => {
            if (!msg) return;

            try {
                const data = JSON.parse(msg.content.toString());
                await onMessage(data);
                this.channel.ack(msg);
            } catch (err) {
                console.error('❌ Error processing message', err);
                this.channel.nack(msg, false, false); // לא מחזיר לתור
            }
        });
    }
}