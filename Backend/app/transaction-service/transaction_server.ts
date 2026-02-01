import express from 'express';
import dotenv from 'dotenv';
import { createAndInitServiceDatabase } from '../db/database';
import { transactionRoutes } from './transaction_routes';
import { Transaction_Table } from './transaction_schemas';
import cookieParser from 'cookie-parser';

dotenv.config();

/**
 * startTransactionServiceServer
 * 
 * What it does:
 *  - Initializes the authentication database
 *  - Sets up Express application with middleware and routes
 *  - Starts the server on the specified PORT
 * 
 * Returns: Promise<void>
 */
export const startTransactionServiceServer = async () => {
  try {

    const PORT = process.env.TRANSACTION_SERVICE_PORT || 3002;


    console.log('Initializing Transaction DB...');
    const transactionDataSource = await createAndInitServiceDatabase({
      name: 'transaction',
      databaseUrl: process.env.TRANSACTION_DATABASE_URL!, /* ! means that the value is not undefined it's value will be in runtime */
      entities: [Transaction_Table],
    });
    console.log('Connecting to Transaction DB...');
    await transactionDataSource.initialize();
    console.log('Transaction DB connected');

    const app = express();
    app.use(express.json());
    app.use(cookieParser());


    // Logging middleware for Transaction Service
    app.use((req, res, next) => {
      console.log(`[TRANSACTION SERVICE Hit] ${req.method} ${req.url}`);
      next();
    });

    app.use('/transaction', transactionRoutes);
    const server = await new Promise<import('http').Server>((resolve, reject) => {
      const s = app.listen(PORT, () => {
        console.log(`🚀 Transaction Service IS RUNNING at port ${PORT}`);
        resolve(s);
      });
      s.on('error', reject);
    });
    return server;


  } catch (err) {
    console.error('Error during Start Auth Service Server', err);
    throw err;
  }
};