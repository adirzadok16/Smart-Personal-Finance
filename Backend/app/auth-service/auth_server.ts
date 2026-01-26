import express from 'express';
import dotenv from 'dotenv';
import { createAndInitServiceDatabase } from '../db/database';
import authRoutes from './auth_routes';
import { User_Table } from './auth_schemas';

dotenv.config();

/**
 * startAuthServiceServer
 * 
 * What it does:
 *  - Initializes the authentication database
 *  - Sets up Express application with middleware and routes
 *  - Starts the server on the specified PORT
 * 
 * Returns: Promise<void>
 */
export const startAuthServiceServer = async () => {
  try {

    const PORT = process.env.AUTH_SERVICE_PORT || 3001;


    console.log('Initializing Auth DB...');
    const authDataSource = await createAndInitServiceDatabase({
      name: 'auth',
      databaseUrl: process.env.AUTH_DATABASE_URL!, /* ! means that the value is not undefined it's value will be in runtime */
      entities: [User_Table],
    });
    console.log('Connecting to Auth DB...');
    await authDataSource.initialize();
    console.log('Auth DB connected');

    const app = express();
    app.use(express.json());
    app.use('/auth',authRoutes);
    const server = await new Promise<import('http').Server>((resolve, reject) => {
      const s = app.listen(PORT, () => {
        console.log(`🚀 Auth Service IS RUNNING at port ${PORT}`);
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