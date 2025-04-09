import { AuthErrors } from '../authTypesCopy'

const validators = {
    // /**
    //  * Validate email format => unneeded due to schema's "format: email" ?
    //  * @param {string} email Email to validate
    //  * @returns {boolean} True if email is valid
    //  */
    // isValidEmail(email: string) {
    //   const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    //   return emailRegex.test(email);
    // },

    /**
     * Validate password
     * @param {string} password
     * @returns {number} ErrorNum if invalid, else 0
     */
    identifyPasswordError(password: string) {
        const passwordUpperRegex = /[A-Z]/;
        const passwordLowerRegex = /[a-z]/;
        const passwordDigitRegex = /[0-9]/;
        const passwordSpecialRegex = /[!@#$%^&*()_+-=\[\]{};:"\|,.<>\?]/
        if (password.length < 8)
            return AuthErrors.PasswordTooShort;
        if (password.length > 256)
            return AuthErrors.PasswordTooLong;
        else if ((!passwordUpperRegex.test(password)) || (!passwordLowerRegex.test(password)) || (!passwordDigitRegex.test(password)) || (!passwordDigitRegex.test(password)))
            return AuthErrors.PasswordNotAccGuideline
        return null;
    }
}

module.exports = validators;