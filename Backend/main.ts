import 'reflect-metadata';
import { startGateway } from './app/app_getaway';
import { startAuthServiceServer } from './app/auth-service/auth_server';
import { closeAllServiceDatabases, dropAllTablesAcrossServices } from './app/db/database';
import RedisService from './app/utilities/redis_service';
import { startTransactionServiceServer } from './app/transaction-service/transaction_server';
import RabbitMQService from './app/utilities/rabbitmq';
import { startDashboardServiceServer } from './app/dashboard-service/dashboard_server';
import { seedAllDatabases } from './app/db/mockdata';

/**
 * Main function to start all services
 */
async function run() {
    try {
        console.log('🔗 Connecting to Services...');
        await RabbitMQService.connect();
        await RabbitMQService.assertExchange('transactions');
        await RedisService.connect();

        console.log('🚀 Starting all service servers...');
        const gateway = await startGateway();
        console.log('✅ API Gateway started');

        const authServer = await startAuthServiceServer();
        console.log('✅ Auth Service started');

        const transactionServer = await startTransactionServiceServer();
        console.log('✅ Transaction Service started');

        const dashboardServer = await startDashboardServiceServer();
        console.log('✅ Dashboard Service started');


        console.log('🌱 Seeding all databases...');
        await seedAllDatabases();
        console.log('🌱 All databases seeded successfully');


        console.log('🎉 All services are running successfully!');

        /**
         * Graceful shutdown procedure
         * - Stops servers
         * - Closes DB connections
         * - Shuts down Redis
         */
        const gracefulShutdown = async (signal: string) => {
            console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);

            // ------------------ Stop Servers ------------------
            console.log('🛑 Stopping servers...');
            if (gateway) {
                await gateway.close();
                console.log('✅ Gateway stopped');
            }
            if (authServer) {
                await authServer.close();
                console.log('✅ Auth Service stopped');
            }
            if (transactionServer) {
                await transactionServer.close();
                console.log('✅ Transaction Service stopped');
            }
            if (dashboardServer) {
                await dashboardServer.close();
                console.log('✅ Dashboard Service stopped');
            }

            // ------------------ Close Connections ------------------
            console.log('🔌 Closing database connections...');
            await closeAllServiceDatabases();
            console.log('✅ Databases disconnected');

            console.log('🔌 Shutting down Redis...');
            await RedisService.shutdown();

            console.log('🧹 Dropping all tables across services...');
            await dropAllTablesAcrossServices();
            console.log('🧹 All tables dropped across services');

            console.log('🟢 Graceful shutdown complete. Exiting process.');
            process.exit(0);
        };

        // ------------------ Register OS Signals ------------------
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

    } catch (err) {
        console.error('💥 Fatal error during startup:', err);
        process.exit(1);
    }
}

// ------------------ Run the application ------------------
run();
