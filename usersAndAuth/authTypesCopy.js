"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthErrors = void 0;
var AuthErrors;
(function (AuthErrors) {
    AuthErrors[AuthErrors["DuplicateEmail"] = 0] = "DuplicateEmail";
    AuthErrors[AuthErrors["InvalidPassword"] = 1] = "InvalidPassword";
    AuthErrors[AuthErrors["UnknownEmail"] = 2] = "UnknownEmail";
    AuthErrors[AuthErrors["PasswordTooShort"] = 3] = "PasswordTooShort";
    AuthErrors[AuthErrors["PasswordTooLong"] = 4] = "PasswordTooLong";
    AuthErrors[AuthErrors["PasswordNotAccGuideline"] = 5] = "PasswordNotAccGuideline";
    AuthErrors[AuthErrors["LackingAuthorizationHeader"] = 6] = "LackingAuthorizationHeader";
    AuthErrors[AuthErrors["Unauthorized"] = 7] = "Unauthorized";
    AuthErrors[AuthErrors["BackendError"] = 8] = "BackendError";
})(AuthErrors || (exports.AuthErrors = AuthErrors = {}));
// POST /api/auth/register   - For new user registration
// POST /api/auth/login      - For user authentication
// POST /api/auth/logout     - For ending sessions (only if logged in)
// POST /api/auth/refresh    - For extending (only if logged in)
const authServiceTypeGuards = {};
