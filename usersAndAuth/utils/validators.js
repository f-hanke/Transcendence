"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const authTypesCopy_1 = require("../authTypesCopy");
const validators = {
    /**
     * Validate email format => unneeded due to schema's "format: email" ?
     * @param {string} email Email to validate
     * @returns {boolean} True if email is valid
     */
    isValidEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    },
    /**
     * Validate password
     * @param {string} password
     * @returns {number} ErrorNum if invalid, else 0
     */
    identifyPasswordError(password) {
        const passwordUpperRegex = /[A-Z]/;
        const passwordLowerRegex = /[a-z]/;
        const passwordDigitRegex = /[0-9]/;
        const passwordSpecialRegex = /[!@#$%^&*()_+-=\[\]{};:"\|,.<>\?]/;
        if (password.length < 8)
            return authTypesCopy_1.AuthErrors.PasswordTooShort;
        if (password.length > 256)
            return authTypesCopy_1.AuthErrors.PasswordTooLong;
        else if ((!passwordUpperRegex.test(password)) || (!passwordLowerRegex.test(password)) || (!passwordDigitRegex.test(password)) || (!passwordDigitRegex.test(password)))
            return authTypesCopy_1.AuthErrors.PasswordNotAccGuideline;
        return null;
    }
};
module.exports = validators;
