import express from 'express';
import dotenv from 'dotenv';
import { createAndInitServiceDatabase } from '../db/database';
import { dashboardRoutes } from './dashboard_routes';
import { DashboardSummary_Table } from './dashboard_schemas';
import { startDashboardSubscriber } from './dashboard_consumer';

dotenv.config();

/**
 * startDashboardServiceServer
 *
 * Responsibilities:
 *  - Initialize Dashboard DB (read model)
 *  - Start RabbitMQ subscriber (NO connect here)
 *  - Setup Express routes
 *  - Start HTTP server
 */
export const startDashboardServiceServer = async () => {
  try {
    const PORT = process.env.DASHBOARD_SERVICE_PORT || 3003;

    // ---------------- DB ----------------
    console.log('📊 Initializing Dashboard DB...');
    const dashboardDataSource = await createAndInitServiceDatabase({
      name: 'dashboard',
      databaseUrl: process.env.DASHBOARD_DATABASE_URL!,
      entities: [DashboardSummary_Table],
    });

    await dashboardDataSource.initialize();
    console.log('✅ Dashboard DB connected');

    // ---------------- RabbitMQ Subscriber ----------------
    console.log('📡 Starting Dashboard subscriber...');
    await startDashboardSubscriber();
    console.log('📡 Dashboard subscriber started');

    // ---------------- Express ----------------
    const app = express();
    app.use(express.json());

    app.use('/dashboard', dashboardRoutes);

    const server = await new Promise<import('http').Server>((resolve, reject) => {
      const s = app.listen(PORT, () => {
        console.log(`🚀 Dashboard Service is running on port ${PORT}`);
        resolve(s);
      });
      s.on('error', reject);
    });

    return server;

  } catch (err) {
    console.error('❌ Error starting Dashboard Service', err);
    throw err;
  }
};
