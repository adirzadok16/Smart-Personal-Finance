import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
import dotenv from 'dotenv';
dotenv.config();

class RabbitMQService {
    private static connection: amqp.ChannelModel | null = null;
    private static channel: Channel | null = null;
    private static connecting: Promise<void> | null = null;

    private constructor() {} // מניעת יצירת מופעים

    // ------------------ CONNECT ------------------
    /**
     * Connect to RabbitMQ if not already connected
     */
    public static async connect() {
        if (this.channel && this.connection) {
            console.log('[RABBITMQ] Already connected');
            return;
        }

        if (!this.connecting) {
            console.log('[RABBITMQ] Connecting to RabbitMQ...');
            this.connecting = (async () => {
                this.connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost:5672');
                this.channel = await this.connection.createChannel();

                console.log('✅ [RABBITMQ] Connected successfully');

                // Handle unexpected close
                this.connection.on('close', () => {
                    console.log('[RABBITMQ] Connection closed');
                    this.connection = null;
                    this.channel = null;
                });

                this.connection.on('error', (err) => {
                    console.error('❌ [RABBITMQ] Connection error:', err);
                    this.connection = null;
                    this.channel = null;
                });

                this.connecting = null;
            })();
        }

        return this.connecting;
    }

    // ------------------ GET CHANNEL ------------------
    private static async getChannel(): Promise<Channel> {
        if (!this.channel) {
            await this.connect();
        }
        if (!this.channel) throw new Error('RabbitMQ channel not available');
        return this.channel;
    }

    // ------------------ ASSERT EXCHANGE ------------------
    public static async assertExchange(exchange: string, type: 'topic' | 'direct' | 'fanout' = 'topic') {
        const channel = await this.getChannel();
        console.log(`[RABBITMQ] Asserting exchange: ${exchange} (${type})`);
        await channel.assertExchange(exchange, type, { durable: true });
        console.log(`[RABBITMQ] Exchange ${exchange} ready`);
    }

    // ------------------ PUBLISH MESSAGE ------------------
    public static async publish(exchange: string, routingKey: string, message: object) {
        const channel = await this.getChannel();
        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log(`[RABBITMQ] Published message to ${exchange} with key ${routingKey}`);
    }

    // ------------------ SUBSCRIBE TO QUEUE ------------------
    public static async subscribe(
        exchange: string,
        queue: string,
        routingKeys: string[],
        onMessage: (data: any) => Promise<void>
    ) {
        const channel = await this.getChannel();
        await channel.assertQueue(queue, { durable: true });
        console.log(`[RABBITMQ] Queue ${queue} asserted`);

        for (const key of routingKeys) {
            await channel.bindQueue(queue, exchange, key);
            console.log(`[RABBITMQ] Queue ${queue} bound to routing key ${key}`);
        }

        await channel.consume(queue, async (msg: ConsumeMessage | null) => {
            if (!msg) return;
            try {
                const data = JSON.parse(msg.content.toString());
                console.log('[RABBITMQ] Received message:', data);
                await onMessage(data);
                channel.ack(msg);
            } catch (err) {
                console.error('❌ [RABBITMQ] Error processing message', err);
                channel.nack(msg, false, false); // לא להחזיר למסוף
            }
        });
        console.log(`[RABBITMQ] Subscribed to queue: ${queue}`);
    }

    // ------------------ SHUTDOWN ------------------
    public static async shutdown() {
        if (this.channel) {
            await this.channel.close();
            this.channel = null;
        }
        if (this.connection) {
            await this.connection.close();
            this.connection = null;
        }
        console.log('✅ [RABBITMQ] Connection closed');
    }
}

export default RabbitMQService;
