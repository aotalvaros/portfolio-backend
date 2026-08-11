# AGENTS

## Purpose
This repository is a Node.js backend API built with TypeScript, Express, MongoDB, Socket.IO, and JWT authentication. AI coding agents should use this file to understand project structure, entrypoints, and common conventions before making code changes.

## Entrypoints
- `src/index.ts` is the main server entrypoint used by the build and start scripts.
- `src/app.ts` is a lightweight Express app setup but is not the primary runtime entry for `npm start` or `npm run dev`.

## Important commands
- `npm install` — install dependencies
- `npm run dev` — development server with `ts-node-dev`
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run compiled production server from `dist/index.js`
- `npm run migrate:module-status` — run the module status migration script
- `npm run migrate:add-category` — run the module category migration script

## Key directories
- `src/config/` — database connection and configuration
- `src/controllers/` — request handlers for auth, modules, contact, refresh tokens, and user profile management
- `src/domain/` — domain logic and use cases
- `src/middleware/` — shared request middleware like auth, rate limiting, and timing
- `src/models/` — Mongoose models and schema definitions (User with phone field)
- `src/routes/` — Express router definitions for auth, modules, contact, and user endpoints
- `src/services/` — application services including keep-alive and email
- `src/sockets/` — WebSocket initialization and event handling
- `src/schemas/` — request validation schemas using Zod
- `src/utils/` — utility helpers for logging, hashing, cache, and validation

## Architecture notes
- Express routes are registered in `src/index.ts` with `/contact`, `/modules`, `/auth`, and `/user` routers.
- The server starts a Socket.IO instance and keep-alive cron jobs on startup.
- `/health` and `/ping` are health and keep-alive endpoints; `/ping` imports the MongoDB keep-alive service dynamically.
- JWT auth is used for protected routes and refresh tokens.
- User routes (`/user/profile`, `/user/password`) require `authMiddleware` and use JWT token from Authorization header.
- User model includes: `_id`, `email`, `password`, `name`, `avatar`, `phone`, `role`, `permissions`, `refreshToken`, `createdAt`, `updatedAt`.

## Environment variables
- `NODE_ENV`
- `PORT`
- `JWT_SECRET`
- `MONGODB_URI`
- `API_BASE_URL`
- `LOG_LEVEL`
- `RESEND_API_KEY`

## Coding guidance
- Preserve route structure and the existing Express middleware order.
- Use Zod schemas for request validation in `src/schemas/`.
- Avoid changing `src/index.ts` startup flow unless the change is specifically about server initialization, socket setup, or keep-alive behavior.
- Prefer updating existing controllers/services over adding duplicate implementations.

## Recent changes
- Added user profile management with `/user` routes (GET profile, PATCH profile, PATCH password)
- Added `phone` field to User model schema
- User routes protected with `authMiddleware` requiring valid JWT token in Authorization header
- New controller `src/controllers/user.controller.ts` with profile and password handlers

## Notes for agents
- There are no dedicated test files in this repository currently.
- Use `AGENTS.md` as the primary high-level guide rather than inferring behavior only from source code.
- When modifying user routes, always preserve `authMiddleware` protection and JWT validation.
