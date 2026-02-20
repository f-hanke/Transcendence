# ft_transcendence

> Final project of the 42 Common Core — a full-stack multiplayer Pong platform built with a microservices architecture.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Services](#services)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Team](#team)

---

## Overview

**ft_transcendence** is a real-time multiplayer Pong game platform. Players can compete locally or online, join tournaments, chat with friends, and manage their profiles — all from a single-page web application served over HTTPS.

The entire backend is split into independent microservices communicating over HTTP and a RabbitMQ message bus, all orchestrated with Docker Compose.

---

## Architecture

```
Client Browser (HTTPS :8443)
          │
    ┌─────▼──────┐
    │ API Gateway │  ← Single HTTPS entry point, JWT validation
    └─────┬──────┘
          │
  ┌───────┼──────────┬────────────┬──────────┐
  ▼       ▼          ▼            ▼          ▼
Web    Auth &      Game        Match-      Chat
server  Users     Service      making     Service
(10005) (10004)   (10003)      (10002)    (10001)
          │         │            │          │
       SQLite    SQLite       SQLite     SQLite
                    │            │          │
                    └────────────┴──────────┘
                                 │
                           RabbitMQ (5672)
                       (async event bus between services)
```

All client traffic enters through the **API Gateway** on port `8443` (HTTPS). The gateway validates JWTs and proxies requests to the appropriate internal service. Services communicate asynchronously via **RabbitMQ** for events like match results and tournament notifications.

---

## Services

### API Gateway (`/apiGateway`)
The single HTTPS entry point for all client requests.
- Terminates TLS (self-signed certificates)
- Validates JWT tokens on every request
- Routes traffic to internal services via reverse proxy:
  - `/AUTHENTICATION/*` → Auth service
  - `/MATCHMAKING/*` → Matchmaking service
  - `/GAMESERVICE/*` → Game service
  - `/CHATSERVICE/*` → Chat service
  - `/` → Webserver

---

### Auth & Users Service (`/usersAndAuth`)
Handles all identity, authentication, and user profile management.
- User registration and login
- Password hashing with **bcrypt**
- JWT token issuance and verification
- Profile updates: display name, email, avatar (resized with `sharp`)
- Match and tournament history per user
- Consumes RabbitMQ messages to record game results

---

### Game Service (`/backend`)
The Pong game engine — the core of the project.
- Real-time game state managed over **WebSockets**
- Three game modes:
  - **Local PvP** — two players on the same keyboard
  - **Local vs AI** — single player against an AI opponent
  - **Remote** — two players over the network
- Ball physics, paddle collision, and score tracking
- AI with predictive ball trajectory (with randomized miss rate)
- Publishes match results to RabbitMQ upon game end
- Game constants: 800×400 canvas, max 5 points, ball speed 4px/frame

---

### Matchmaking Service (`/remote`)
Manages game rooms and the tournament system.
- Creates and tracks public, private, and tournament game sessions
- **4-player single-elimination tournaments**:
  - Two semi-finals
  - A final
  - A bronze/3rd-place match
- Player ELO/ranking system
- Real-time updates over WebSockets
- Publishes tournament progression events to RabbitMQ

---

### Chat Service (`/chat-service`)
Real-time messaging and social features.
- Persistent 1-on-1 chat over **WebSockets**
- Friend request system (send / accept / remove)
- Chat history stored in SQLite
- Receives tournament notifications from RabbitMQ and forwards them to connected clients
- Multi-language support (EN, FR, DE)

---

### Webserver (`/webserver`)
Serves the compiled Vue.js frontend as a static SPA.
- SPA fallback routing (all 404s return `index.html`)
- In-memory file caching
- JWT middleware

---

### Frontend (`/frontend`)
Single-page application built with **Vue 3 + Vite**.
- Pages: Auth, Dashboard, Game, Profile, Chat, Tournaments
- Real-time game rendering on HTML Canvas
- WebSocket clients for game and chat
- State stores for: game state, tournament, chat, user session, modals
- Tournament bracket visualization
- Tailwind CSS styling with flat icons

---

### Shared Library (`/shared`)
Centralized TypeScript type definitions and constants shared across all services.
- Type definitions for every service boundary (Auth, Game, Chat, Matchmaking, RabbitMQ)
- Game constants (`gameSettings`)
- Network configuration (`transNetworkSettings`)
- Type guards and utility functions

---

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (all services + frontend) |
| Runtime | Node.js 20 (Alpine) |
| HTTP Framework | Fastify |
| Frontend | Vue 3, Vite, Tailwind CSS |
| Real-time | WebSockets (`@fastify/websocket`) |
| Authentication | JWT (`@fastify/jwt`), bcrypt |
| Database | SQLite3 (`better-sqlite3`) |
| Message Queue | RabbitMQ 3 + `amqplib` |
| Image Processing | sharp |
| Logging | Winston, chalk |
| Containerization | Docker, Docker Compose |
| Reverse Proxy | Fastify HTTP Proxy (`@fastify/http-proxy`) |
| Transport Security | HTTPS (self-signed TLS) |

---

## Features

- **Multiplayer Pong** — local and online modes
- **AI opponent** — with predictive behavior
- **Tournaments** — 4-player single-elimination brackets with semi-finals, finals, and bronze match
- **Real-time chat** — persistent WebSocket messaging
- **Friend system** — friend requests, accept/remove
- **User profiles** — custom avatars, display names, match history
- **JWT authentication** — stateless, validated at the gateway
- **Event-driven architecture** — RabbitMQ decouples services
- **Multi-language UI** — English, French, German

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- `make`

### Run

```bash
# Full build and start
make all

# Start (after first build)
make up

# Stop
make down

# Rebuild everything from scratch
make fresh-start

# View logs
make logs

# Health check all services
make status
```

The app will be available at **https://localhost:8443**.

> Your browser will warn about the self-signed certificate — this is expected. Accept the exception to proceed.

### Useful Makefile targets

| Target | Description |
|---|---|
| `make all` | Build shared lib, frontend, then start all containers |
| `make up` / `make down` | Start / stop containers |
| `make rebuild` | Rebuild all Docker images |
| `make fresh-start` | Full rebuild without Docker cache |
| `make reset-all` | Wipe all volumes and do a fresh start |
| `make clean` | Remove containers and images (keep data) |
| `make clean-volumes` | Remove all persistent data volumes |
| `make wipe-docker-everything` | Nuclear option — removes all local Docker state |

---

## Team

- [@elecarlier](https://github.com/elecarlier)
- [@smatthes42berlin](https://github.com/smatthes42berlin)
- [@f-hanke](https://github.com/f-hanke)
- [@jackoske](https://github.com/jackoske)
- mtadic

---

*42 Berlin — ft_transcendence*
