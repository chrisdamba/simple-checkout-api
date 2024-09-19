# Simple Checkout API

A robust and secure API for managing a simple checkout system, built with Node.js, TypeScript, Express, and PostgreSQL.

## Features

- Product management (CRUD operations)
- Payment processing with status tracking
- Secure authentication using OAuth 2.0 with Auth0
- Redis caching for improved performance
- Comprehensive unit tests using Jest
- Follows SOLID design principles and best practices
- Detailed error handling
- Database seeding for development and testing
- Comprehensive unit tests using Jest

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v20 or later)
- npm (v6 or later)
- PostgreSQL (v12 or later)
- Redis (v6 or later)
- An Auth0 account for authentication

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/chrisdamba/simple-checkout-api.git
   cd checkout-api
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following variables:
   ```
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=your_db_username
   DB_PASSWORD=your_db_password
   DB_NAME=checkout_db
   REDIS_HOST=localhost
   REDIS_PORT=6379
   AUTH0_SECRET=your_auth0_secret
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
   AUTH0_AUDIENCE=your_api_identifier
   AUTH0_DOMAIN=your-domain.auth0.com
   ```

## Database Setup

1. Create a PostgreSQL database:
   ```
   createdb checkout_db
   ```

2. Run database migrations:
   ```
   npm run typeorm migration:run
   ```

3. (Optional) Seed the database with sample data:
   ```
   npm run seed
   ```

## Usage

1. Start the development server:
   ```
   npm run dev
   ```

2. Build the project for production:
   ```
   npm run build
   ```

3. Start the production server:
   ```
   npm start
   ```

The API will be available at `http://localhost:3000` (or the port you specified in the .env file).

## API Endpoints

- `GET /api/products`: Get all products
- `POST /api/products`: Create a new product
- `GET /api/payments`: Get all payments
- `POST /api/payments`: Create a new payment
- `PUT /api/payments/:id/status`: Update payment status
- `GET /api/payments/status`: Get payments by status
- `GET /api/payments/total-completed`: Get total of completed payments

## Authentication

This API uses Auth0 for authentication. To access protected endpoints, you need to include a valid JWT token in the Authorization header of your requests.

## Testing

Run the test suite:

```
npm test
```

To run tests in watch mode:

```
npm run test:watch
```

## Logging

Logs are stored in the `logs` directory:
- `error.log`: Contains error logs
- `all.log`: Contains all logs (including info, warn, and error)


## Acknowledgements

- [Express.js](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Auth0](https://auth0.com/)
- [Jest](https://jestjs.io/)
