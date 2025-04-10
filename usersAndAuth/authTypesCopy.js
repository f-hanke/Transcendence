"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthErrors = void 0;
var AuthErrors;
(function (AuthErrors) {
    AuthErrors[AuthErrors["DuplicateEmail"] = 30] = "DuplicateEmail";
    AuthErrors[AuthErrors["InvalidPassword"] = 31] = "InvalidPassword";
    AuthErrors[AuthErrors["UnknownEmail"] = 32] = "UnknownEmail";
    AuthErrors[AuthErrors["PasswordTooShort"] = 33] = "PasswordTooShort";
    AuthErrors[AuthErrors["PasswordTooLong"] = 34] = "PasswordTooLong";
    AuthErrors[AuthErrors["PasswordNotAccGuideline"] = 35] = "PasswordNotAccGuideline";
    AuthErrors[AuthErrors["LackingAuthorizationHeader"] = 36] = "LackingAuthorizationHeader";
    AuthErrors[AuthErrors["Unauthorized"] = 37] = "Unauthorized";
    AuthErrors[AuthErrors["BackendError"] = 38] = "BackendError";
})(AuthErrors || (exports.AuthErrors = AuthErrors = {}));
function isErrorResponseBody(arg) {
    return (typeof arg === "object" &&
        arg !== null &&
        "reason" in arg &&
        Object.values(AuthErrors).includes((arg.reason)));
}
// POST /api/auth/register   - For new user registration
// POST /api/auth/login      - For user authentication
// GET  /api/auth/logout     - For ending sessions (only if logged in)
// GET  /api/auth/refresh    - For extending (only if logged in)
const authServiceTypeGuards = {};
