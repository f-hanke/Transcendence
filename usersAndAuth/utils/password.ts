/**
 * Password utilities for hashing and verification
 */
'use strict';

import bcrypt from 'bcrypt';
import { config } from '../config/config.js';

const passwordUtils = {
  /**
   * Hash a password
   * @param {string} password Plain text password
   * @returns {Promise<string>} Hashed password
   */
  async hashPassword(password: string) {
    try {
      return await bcrypt.hash(password, config.SALT_ROUNDS);
    } catch (error) {
      throw new Error('Password hashing failed');
    }
  },
  
  /**
   * Compare password with hash
   * @param {string} password Plain text password
   * @param {string} hash Hashed password
   * @returns {Promise<boolean>} True if password matches hash
   */
  async comparePassword(password: string, hash: string) {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Password comparison failed');
    }
  },

  /**
   * Password validation
   * @param {string} password Password to validate
   * @returns {Object} Validation result
   */
  validatePassword(password: string) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const isValid = password.length >= minLength && 
                   hasUpperCase && 
                   hasLowerCase && 
                   hasNumber;
    
    return {
      isValid,
      messages: {
        length: password.length < minLength ? `Password must be at least ${minLength} characters` : null,
        upperCase: !hasUpperCase ? 'Password must contain at least one uppercase letter' : null,
        lowerCase: !hasLowerCase ? 'Password must contain at least one lowercase letter' : null,
        number: !hasNumber ? 'Password must contain at least one number' : null,
        specialChar: !hasSpecialChar ? 'Password should contain at least one special character' : null,
      }
    };
  }
};

export { passwordUtils };
