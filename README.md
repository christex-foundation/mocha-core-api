# Mocha Wallet API (WIP)

Mocha wallet API is a NodeJS project, built with [Hono][1] that provides a RESTful API to manage wallets and transaction intents.

> The codebase is a work-in-progress (WIP) and is still under development.

## Prerequisites

- Node.js (version 20.12.X or higher)
- [Vercel CLI](https://vercel.com/cli) (for local development)

## Local Development

1. Clone the repository:

   ```sh
   git clone https://github.com/christex-foundation/mocha-whatsapp-wallet.git
   cd mocha-wallet-api
   ```

2. Install dependencies:

   ```sh
   npm install
   ```

3. Set up environment variables:

   - Option 1: Pull from Vercel

     ```sh
     npx vercel env pull
     ```

   - Option 2: Create a `.env` file based on `.env.example`

4. Start the development server:
   ```
   npm run dev
   ```

## Testing

Run the test suite:

```sh
npm run test
```

## Project Structure

```
mocha-wallet-api/
├── __tests__/
├── api/
├── src/
│   ├── middleware/
│   ├── repos/
│   ├── routes/
│   ├── schemas/
│   └── utils/
├── scripts/
└── ...
```

- `__tests__/`: Test files
- `api/`: Serverless function entry points
- `src/`: Main source code
  - `middleware/`: Custom middleware (e.g., error handling)
  - `repos/`: Data access layer
  - `routes/`: API route handlers
  - `schemas/`: Data validation schemas
  - `utils/`: Utility functions and helpers
- `scripts/`: Utility scripts for development and maintenance

## ToDo

- [x] Implement intents
- [x] Improve the stability of the intents route.
- [ ] Refactor and optimize the experimental code sections.
- [ ] Implement Wallet-as-a-Service (WaaS) provider
- [ ] Implement cash-in conversion flow
- [ ] Implement cash-out conversion flow
