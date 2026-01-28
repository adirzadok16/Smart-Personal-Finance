import amqp, { Channel, ChannelModel, ConsumeMessage } from 'amqplib';

export class RabbitMQService {
    private static connection: ChannelModel;
    private static channel: Channel;

    // URL for RabbitMQ connection from environment variables
    private static readonly RABBIT_URL = process.env.RABBITMQ_URL || "";

    // ======================
    // CONNECT TO RABBITMQ
    // ======================
    static async connect() {
        if (this.channel) {
            console.log('[RABBITMQ] Already connected');
            return;
        }

        console.log('[RABBITMQ] Connecting to RabbitMQ...');
        this.connection = await amqp.connect(this.RABBIT_URL);
        this.channel = await this.connection.createChannel();
        console.log('✅ [RABBITMQ] Connected successfully');
    }

    // ======================
    // ASSERT EXCHANGE
    // ======================
    /**
     * Creates or checks an exchange exists
     * @param exchange - Name of the exchange
     * @param type - Exchange type ('topic', 'direct', 'fanout')
     */
    static async assertExchange(
        exchange: string,
        type: 'topic' | 'direct' | 'fanout' = 'topic'
    ) {
        console.log(`[RABBITMQ] Asserting exchange: ${exchange} with type: ${type}`);
        await this.channel.assertExchange(exchange, type, { durable: true });
        console.log(`[RABBITMQ] Exchange ${exchange} ready`);
    }

    // ======================
    // PUBLISH MESSAGE
    // ======================
    /**
     * Publishes a message to an exchange
     * @param exchange - Exchange name
     * @param routingKey - Routing key for the message
     * @param message - Object message to send
     */
    static publish(exchange: string, routingKey: string, message: object): void {
        if (!this.channel) {
            console.error('[RABBITMQ] Publish failed: Channel not connected');
            throw new Error('RabbitMQ not connected');
        }

        console.log(`[RABBITMQ] Publishing message to exchange: ${exchange}, routingKey: ${routingKey}`);
        this.channel.publish(
            exchange,
            routingKey,
            Buffer.from(JSON.stringify(message)),
            { persistent: true }
        );
        console.log('[RABBITMQ] Message published successfully');
    }

    // ======================
    // SUBSCRIBE TO QUEUE
    // ======================
    /**
     * Subscribes to a queue and processes incoming messages
     * @param exchange - Exchange name
     * @param queue - Queue name
     * @param routingKeys - Array of routing keys to bind
     * @param onMessage - Callback to process messages
     */
    static async subscribe(
        exchange: string,
        queue: string,
        routingKeys: string[],
        onMessage: (data: any) => Promise<void>
    ) {
        console.log(`[RABBITMQ] Subscribing to queue: ${queue} on exchange: ${exchange}`);
        await this.channel.assertQueue(queue, { durable: true });
        console.log(`[RABBITMQ] Queue ${queue} asserted`);

        for (const key of routingKeys) {
            console.log(`[RABBITMQ] Binding queue ${queue} to routing key: ${key}`);
            await this.channel.bindQueue(queue, exchange, key);
        }

        console.log(`[RABBITMQ] Starting to consume messages from queue: ${queue}`);
        await this.channel.consume(queue, async (msg: ConsumeMessage | null) => {
            if (!msg) return;

            try {
                const data = JSON.parse(msg.content.toString());
                console.log('[RABBITMQ] Received message:', data);
                await onMessage(data);
                this.channel.ack(msg);
                console.log('[RABBITMQ] Message processed and acknowledged');
            } catch (err) {
                console.error('❌ [RABBITMQ] Error processing message', err);
                this.channel.nack(msg, false, false); // Reject message, do not requeue
            }
        });
    }
}
