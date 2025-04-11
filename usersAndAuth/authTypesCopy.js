"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthErrors = void 0;
exports.isErrorResponseBody = isErrorResponseBody;
exports.isRegSubmissionBody = isRegSubmissionBody;
exports.isLoginSubmissionBody = isLoginSubmissionBody;
var AuthErrors;
(function (AuthErrors) {
    AuthErrors[AuthErrors["BadBodyFormat"] = 1] = "BadBodyFormat";
    AuthErrors[AuthErrors["DuplicateEmail"] = 2] = "DuplicateEmail";
    AuthErrors[AuthErrors["InvalidPassword"] = 3] = "InvalidPassword";
    AuthErrors[AuthErrors["InvalidEmailFormat"] = 4] = "InvalidEmailFormat";
    AuthErrors[AuthErrors["UnknownEmail"] = 5] = "UnknownEmail";
    AuthErrors[AuthErrors["PasswordTooShort"] = 6] = "PasswordTooShort";
    AuthErrors[AuthErrors["PasswordTooLong"] = 7] = "PasswordTooLong";
    AuthErrors[AuthErrors["PasswordNotAccGuideline"] = 8] = "PasswordNotAccGuideline";
    AuthErrors[AuthErrors["LackingAuthorizationHeader"] = 9] = "LackingAuthorizationHeader";
    AuthErrors[AuthErrors["Unauthorized"] = 10] = "Unauthorized";
    AuthErrors[AuthErrors["BackendError"] = 11] = "BackendError";
})(AuthErrors || (exports.AuthErrors = AuthErrors = {}));
function isErrorResponseBody(arg) {
    return (typeof arg === "object" &&
        arg !== null &&
        "reason" in arg &&
        Object.values(AuthErrors).includes((arg.reason)));
}
function isRegSubmissionBody(arg) {
    return (typeof arg === "object" &&
        arg !== null &&
        typeof arg.email === "string" &&
        typeof arg.password === "string" &&
        typeof arg.displayName === "string");
}
function isLoginSubmissionBody(arg) {
    return (typeof arg === "object" &&
        arg !== null &&
        typeof arg.email === "string" &&
        typeof arg.password === "string");
}
// POST /api/auth/register   - For new user registration
// POST /api/auth/login      - For user authentication
// GET  /api/auth/logout     - For ending sessions (only if logged in)
// GET  /api/auth/refresh    - For extending (only if logged in)
const authServiceTypeGuards = {};
