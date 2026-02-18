# Smart Personal Finance - Backend

Welcome to the backend of the **Smart Personal Finance** application. This project is built using a microservices-oriented architecture with a central API Gateway, leveraging cutting-edge technologies for reliability and performance.

---

## 🚀 Architecture Overview

The system is composed of several independent services that communicate via REST APIs and RabbitMQ:

- **API Gateway**: The entry point for all client requests. It handles routing and authentication via middleware.
- **Auth Service**: Manages user registration, login, and JWT token issuance/validation.
- **Transaction Service**: Handles all financial transactions (Income/Expenses).
- **Dashboard Service**: Aggregates data and provides statistics for the user dashboard.

### Tech Stack
- **Runtime**: Node.js with TypeScript
- **Framework**: Express & Fastify
- **Database**: PostgreSQL (via TypeORM)
- **Caching**: Redis
- **Messaging**: RabbitMQ
- **Logging**: Winston

---

## 🛠 Prerequisites

Ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18+)
- [Docker & Docker Compose](https://www.docker.com/)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

---

## ⚙️ Configuration

The application uses environment variables for configuration. Create a `.env` file in the `Backend` directory (copy from `.env.docker` or follow the structure below):

```env
# Ports
GATEWAY_PORT=3000
AUTH_SERVICE_PORT=3001
TRANSACTION_SERVICE_PORT=3002
DASHBOARD_SERVICE_PORT=3003

# Security
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret

# Database
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password

# Redis & RabbitMQ
REDIS_URL=redis://:password@host:port
RABBITMQ_URL=amqp://user:password@host:port
```

---

## 🏃 Running the Application

### Using Docker (Recommended)
You can start the entire infrastructure (DB, Redis, RabbitMQ) and the services using Docker Compose:

```bash
docker-compose up --build
```

### Local Development
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server (requires local DB/Redis/RabbitMQ):
   ```bash
   npm run dev
   ```

---

## 📂 Project Structure

```text
Backend/
├── app/
│   ├── auth-service/        # Authentication logic
│   ├── transaction-service/ # Transaction management
│   ├── dashboard-service/   # Dashboard & Statistics
│   ├── db/                  # Database config & Seeding
│   ├── utilities/           # Common utilities (Redis, RabbitMQ, Logger)
│   └── app_getaway.ts       # API Gateway implementation
├── main.ts                  # Application entry point & orchestration
├── docker-compose.yml       # Infrastructure orchestration
└── package.json             # Dependencies and scripts
```

---

## 🛡 Graceful Shutdown

The application includes a robust graceful shutdown mechanism. Upon receiving `SIGINT` or `SIGTERM`, it will:
1. Stop accepting new requests via the Gateway.
2. Shutdown all internal service servers.
3. Drain and close database connections.
4. Cleanly disconnect from Redis and RabbitMQ.

---

## 💡 Seeding Data

When the environment variable `SEED_DATA` is set to `true`, the application will automatically populate the database with mock data upon startup, ensuring a ready-to-use environment for development.
