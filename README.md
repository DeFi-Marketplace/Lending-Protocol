# Stellar P2P Lending Protocol

A decentralized, undercollateralized lending platform built on the Stellar network using Soroban smart contracts.

## Project Structure

```
contract/       Soroban smart contract (Rust)
backend/        Off-chain Express API for credit scoring
frontend/       React app (Vite + TypeScript)
```

## Prerequisites

- Node.js 18+
- Rust + wasm32 target: `rustup target add wasm32-unknown-unknown`
- Soroban CLI: `cargo install soroban-cli`
- Freighter Wallet browser extension

## Quick Start

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:3001`.

### 2. Smart Contract

```bash
cd contract
make build
```

Deploy to testnet:

```bash
make deploy-testnet
```

Generate TypeScript bindings:

```bash
make bindings-testnet
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Edit `.env` with your contract ID and RPC URL:

```
VITE_BACKEND_URL=http://localhost:3001
VITE_CONTRACT_ID=<deployed contract ID>
VITE_RPC_URL=https://soroban-testnet.stellar.org
VITE_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

## Production Build

```bash
cd frontend
npm run build    # outputs to dist/
```

Deploy `dist/` to any static host (Vercel, Netlify, IPFS, etc.).

## Deployment Checklist

- [ ] Contract: Build, deploy to Stellar network, record contract ID
- [ ] Backend: Deploy Express API to a Node.js host (Render, Railway, Fly.io)
- [ ] Frontend: Set `VITE_BACKEND_URL` and `VITE_CONTRACT_ID`, build, deploy

## License

MIT
