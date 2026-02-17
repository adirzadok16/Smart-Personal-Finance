import amqp, { Channel, Connection, ConsumeMessage } from 'amqplib';
import dotenv from 'dotenv';
dotenv.config();

class RabbitMQService {
    private static connection: amqp.ChannelModel | null = null;
    private static channel: Channel | null = null;
    private static connecting: Promise<void> | null = null;

    private constructor() { } // מניעת יצירת מופעים

   // ------------------ CONNECT ------------------
    /**
     * connect
     * 
     * What it does:
     *  - Establishes a connection to RabbitMQ if not already connected
     *  - Creates a channel for publishing/consuming messages
     *  - Handles connection close and error events
     * 
     * Returns: Promise<void>
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
    /**
     * getChannel
     * 
     * What it does:
     *  - Ensures a RabbitMQ connection exists
     *  - Returns the channel for publishing or consuming messages
     * 
     * Returns: Promise<Channel>
     */
    private static async getChannel(): Promise<Channel> {
        if (!this.channel) {
            await this.connect();
        }
        if (!this.channel) throw new Error('RabbitMQ channel not available');
        return this.channel;
    }

    // ------------------ ASSERT EXCHANGE ------------------
    /**
     * assertExchange
     * @param exchange - Exchange name
     * @param type - Exchange type: 'topic' | 'direct' | 'fanout' (default: 'topic')
     * 
     * What it does:
     *  - Asserts (creates if not exists) the exchange
     *  - Makes it durable (the exchange will survive a broker restart)
     */
    public static async assertExchange(exchange: string, type: 'topic' | 'direct' | 'fanout' = 'topic') {
        const channel = await this.getChannel();
        console.log(`[RABBITMQ] Asserting exchange: ${exchange} (${type})`);
        await channel.assertExchange(exchange, type, { durable: true });
        console.log(`[RABBITMQ] Exchange ${exchange} ready`);
    }

    // ------------------ PUBLISH MESSAGE ------------------
    /**
     * publish
     * @param exchange - Exchange name 
     * @param routingKey - Routing key (topic) for the message
     * @param message - Object payload to publish
     * 
     * What it does:
     *  - Converts the message object to JSON and publishes to the exchange
     *  - Marks message as persistent
     */
    public static async publish(exchange: string, routingKey: string, message: object) {
        const channel = await this.getChannel();
        channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), { persistent: true });
        console.log(`[RABBITMQ] Published message to ${exchange} with key ${routingKey}`);
    }

     // ------------------ SUBSCRIBE TO QUEUE ------------------
    /**
     * subscribe
     * @param exchange - Exchange name to listen to
     * @param queue - Queue name that will receive messages
     * @param routingKeys - Array of routing keys (event types) to bind to the queue
     * @param onMessage - Callback function executed when a message is received
     * 
     * What it does:
     *  - Ensures a RabbitMQ connection and channel exist
     *  - Creates the queue if it does not exist
     *  - Binds the queue to the exchange using the provided routing keys
     *  - Starts consuming messages from the queue
     *  - Parses the message payload from JSON
     *  - Passes the message data and routing key to the provided callback
     *  - Acknowledges the message if processed successfully
     *  - Rejects the message if an error occurs (without requeue)
     * 
     * Message Flow:
     *  1. Publisher sends message → exchange
     *  2. Exchange routes message by routing key
     *  3. Queue receives message
     *  4. Consumer processes message via callback
     * 
     * Returns: Promise<void>
     */
    public static async subscribe(
        exchange: string,
        queue: string,
        routingKeys: string[],
        onMessage: (data: any, routingKey: string) => Promise<void>
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
                await onMessage(data, msg.fields.routingKey);
                channel.ack(msg);
            } catch (err) {
                console.error('❌ [RABBITMQ] Error processing message', err);
                channel.nack(msg, false, false); // לא להחזיר למסוף
            }
        });
        console.log(`[RABBITMQ] Subscribed to queue: ${queue}`);
    }

    // ------------------ SHUTDOWN ------------------
    /**
     * shutdown
     * 
     * What it does:
     *  - Closes the RabbitMQ channel if it exists
     *  - Closes the RabbitMQ connection if it exists
     *  - Resets internal connection and channel references
     * 
     * Returns: Promise<void>
     */
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
