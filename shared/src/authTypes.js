"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServiceTypes = void 0;
// POST /api/auth/register   - For new user registration
// POST /api/auth/login      - For user authentication
// POST /api/auth/logout     - For ending sessions (only if logged in)
// POST /api/auth/refresh    - For extending (only if logged in)
const authServiceTypeGuards = {};
