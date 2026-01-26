import 'reflect-metadata';
import { startGateway } from './app/app_getaway';
import { startAuthServiceServer } from './app/auth-service/auth_server';
import { closeAllServiceDatabases } from './app/db/database';
import RedisService from './app/utilities/redis_service';
import { startTransactionServiceServer } from './app/transaction-service/transaction_server';
import { RabbitMQService } from './app/utilities/rabbitmq';

async function run() {
    try {

        await RabbitMQService.connect();
        await RabbitMQService.assertExchange('transactions');
        await RedisService.connectRedis();


        console.log('Starting services...');
        const gateway = await startGateway();
        const authServer = await startAuthServiceServer();
        const transactionServer = await startTransactionServiceServer();

        console.log('🚀 All services are running');

        const gracefulShutdown = async (signal: string) => {
            console.log(`\nReceived ${signal}. Starting graceful shutdown...`);

            // 1. Stop servers (stop accepting new requests)
            console.log('Stopping servers...');
            if (gateway) {
                await gateway.close();
                console.log('Gateway stopped');
            }
            if (authServer) {
                await authServer.close();
                console.log('Auth Service stopped');
            }
            if (transactionServer) {
                await transactionServer.close();
                console.log('Transaction Service stopped');
            }

            // 2. Clear connections
            await closeAllServiceDatabases();
            await RedisService.shutdown();

            console.log('Graceful Redis shutdown complete. Exiting.');
            process.exit(0);
        };

        // Register signals
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    } catch (err) {
        console.error('Fatal error during startup:', err);
        process.exit(1);
    }
}

run();


