import Fastify from 'fastify';
import httpProxy from '@fastify/http-proxy';
import dotenv from 'dotenv';
import cors from '@fastify/cors';



dotenv.config();

/**
 * startGateway
 * 
 * What it does:
 *  - Initializes a Fastify instance
 *  - Registers HTTP proxy routes for Auth, Review, and History services
 *  - Sets up a health check endpoint
 *  - Starts the gateway on the specified PORT
 * 
 * Returns: void
 */
export const startGateway = async () => {
  const app = Fastify();

   await app.register(cors, {
    origin: 'http://localhost:5173', // Vite
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  app.register(httpProxy, {
    upstream: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    prefix: '/api/auth',
    rewritePrefix: '/auth',
  });

  app.register(httpProxy, {
    upstream: process.env.REVIEW_SERVICE_URL || 'http://localhost:3002',
    prefix: '/api/review',
    rewritePrefix: '/review',
  });

  app.register(httpProxy, {
    upstream: process.env.HISTORY_SERVICE_URL || 'http://localhost:3003',
    prefix: '/api/history',
    rewritePrefix: '/history',
  });

  app.get('/health', async () => ({ status: 'Gateway is UP' }));

  const PORT = process.env.GATEWAY_PORT || 3000;

  try {
    const address = await app.listen({ port: Number(PORT), host: '0.0.0.0' });
    console.log(`🚀 Fastify API GATEWAY IS RUNNING at ${address}`);
    return app;
  } catch (err) {
    console.error('Error starting Gateway:', err);
    throw err;
  }
};


