# sol-chat
sol-chat is a modern chat application that explores how **AI, payments, and blockchain** can work together in a *real consumer product*.

It combines **real-time chat**, **AI-powered conversations**, and **Solana-based payments** to experiment with a simple idea:
👉 **AI usage should be transparent, metered, and economically aligned — not unlimited and opaque.**

This project was built for a hackathon to demonstrate how **Solana can power AI + social experiences beyond DeFi**.

---

## What sol-chat does

In simple terms, sol-chat lets users:

* Chat in real time
* Start AI-powered chat sessions
* Pay only for the AI usage they actually consume
* Use Solana wallets instead of centralized accounts

The focus is not on putting everything on-chain, but on using blockchain **where it actually adds value**.

---

## Core Features

* **Decentralized Authentication**
  Login using Solana wallets (Phantom, Solflare, etc.) or OAuth providers.

* **Real-time Chat**
  Clean and fast chat experience with support for AI-enabled sessions.

* **Metered AI Chat (x402)**
  AI-powered chat sessions using x402, where usage is tracked and backed by Solana-based credits.

* **Solana Payments**
  Users can top up credits using SOL and spend them on premium AI interactions.

* **Guest Mode**
  Try the product without signing up to reduce onboarding friction.

* **Transaction History**
  View all Solana-based payments and credit usage.

* **Responsive UI**
  Built with React and Tailwind for a smooth experience across devices.

---

## AI & x402 Integration (Key Part)

sol-chat uses **x402** to power **paid, session-based AI chat**.

Instead of offering unlimited AI access, the application treats AI as a **metered resource**:

* AI responses are generated via **x402**
* Each AI-enabled message consumes **usage credits**
* Credits are backed by **Solana payments**
* AI access is controlled at the **chat-session level**

This allows sol-chat to experiment with a more **sustainable and transparent AI model**, where users pay for what they use and developers avoid abuse or runaway costs.

### Why x402?

x402 fits naturally into this design because it supports:

* Controlled AI execution
* Session-based inference workflows
* Clear separation between AI logic and payment logic

Rather than being “just another LLM”, x402 acts as the **AI execution layer** inside a payment-aware system.

### Flow (high level)

1. User starts a chat session
2. Session is marked as AI-enabled
3. AI requests are routed through x402
4. Credits are deducted per usage
5. Credits are replenished via Solana transactions

This tightly couples **AI inference, usage accounting, and blockchain payments** into one flow.

---

## Why Solana?

Solana is used because it actually fits the product requirements:

* **Fast & low-cost payments**
  Near-instant transactions make micro top-ups practical.

* **Wallet-based authentication**
  Users can authenticate without centralized identity systems.

* **On-chain value tracking**
  Payments and credit balances are verifiable and transparent.

### Hybrid storage approach

* Chat messages → MongoDB (performance + UX)
* Financial & auth-critical data → Solana (immutability + trust)

This keeps the app usable while still being meaningfully decentralized.

---

## Tech Stack

### Backend

* Node.js + Express
* MongoDB
* Passport.js (authentication)
* Solana Web3.js
* x402 API (AI inference)

### Frontend

* React (Vite)
* Tailwind CSS
* shadcn/ui
* Axios

---

## Prerequisites

* Node.js (v16+)
* MongoDB
* Solana CLI (for development)
* Solana wallet (Phantom, Solflare, etc.)

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/alokrajshahi04/sol-chat.git
cd sol-chat
```

### 2. Backend setup

```bash
cd backend
npm install
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

### 4. Environment variables

Create a `.env` file in `backend/` or copy .env.example to .env and fill in the required values:

```env

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_NETWORK=devnet
CREDITS_TOKEN_MINT=credits-token-mint-address
BACKEND_WALLET_PRIVATE_KEY=backend-wallet-private-key-base58
TREASURY_WALLET=treasury-wallet-public-key

# OAuth - Google (optional)
GOOGLE_CLIENT_ID=google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=google-client-secret
GOOGLE_CALLBACK_URL=/api/auth/google/callback

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 5. Run backend

```bash
cd backend
npm start
```

### 6. Run frontend

```bash
cd ../frontend
npm run dev
```

Frontend → `http://localhost:5173`
Backend → `http://localhost:5000`

---

## How to use

1. Login using a Solana wallet or OAuth
2. Start a new chat session
3. Enable AI for the session
4. Use credits to interact with AI
5. Top up credits using SOL
6. View transaction history inside the app

---

## API Overview

### Authentication

* `POST /api/auth/login`
* `POST /api/auth/register`
* `GET /api/auth/logout`

### Chat

* `GET /api/chat/sessions`
* `POST /api/chat/messages`
* `GET /api/chat/messages/:sessionId`

### Payments

* `POST /api/pay/topup`
* `GET /api/transactions`

---

## Hackathon Motivation

This project was built for a hackathon to explore:

* How **AI usage can be fairly monetized**
* How **Solana fits into everyday consumer apps**
* How to balance **UX, decentralization, and cost**

Rather than forcing everything on-chain, sol-chat focuses on **practical Web3 design** that could realistically scale.

---

## Future Scope

* Dynamic AI pricing based on model / context length
* Multi soloana tokens for credit top-ups
* Enhanced AI capabilities (e.g., image generation)
* Mobile app version (for sol mobile)
* Fully on-chain session metadata
* Public or group AI chat rooms

## License

MIT License.

## Acknowledgments

* Solana Foundation
* x402 org
* Open-source community(for components and inspiration)
* Hackathon organizers and participants
And special thanks to Sir Jackob Creech(https://x.com/jacobvcreech) for giving us light on what to make for the hackathon!
