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

  // 1. GLOBAL LOGGING - First thing to run
  app.addHook('onRequest', (request, reply, done) => {
    console.log(`[GATEWAY GLOBAL] ${request.method} ${request.url}`);
    done();
  });

  await app.register(cors, {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // 2. TEST ROUTE - To check if Gateway is alive
  app.get('/api/test', async () => {
    console.log('[GATEWAY] Test route hit');
    return { message: 'Gateway is working!' };
  });

  app.register(httpProxy, {
    upstream: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    prefix: '/api/auth',
    rewritePrefix: '/auth',
  });

  app.register(httpProxy, {
    upstream: process.env.TRANSACTION_SERVICE_URL || 'http://localhost:3002',
    prefix: '/api/transaction',
    rewritePrefix: '/transaction',
  });

  app.register(httpProxy, {
    upstream: process.env.DASHBOARD_SERVICE_URL || 'http://localhost:3003',
    prefix: '/api/dashboard',
    rewritePrefix: '/dashboard',
  });

  // 3. CATCH-ALL 404 handler
  app.setNotFoundHandler((request, reply) => {
    console.log(`[GATEWAY 404] No route for: ${request.method} ${request.url}`);
    reply.status(404).send({
      error: 'Not Found',
      message: `The Gateway does not have a route for ${request.url}`,
      debug_hint: 'Check prefix and rewritePrefix configuration'
    });
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


