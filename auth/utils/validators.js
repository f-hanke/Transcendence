/**
 * Input validation utilities
 */
'use strict';

const validators = {
  /**
   * Validate email format
   * @param {string} email Email to validate
   * @returns {boolean} True if email is valid
   */
  isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  },
  
  /**
   * Validate display name format and length
   * @param {string} displayName Display name to validate
   * @returns {boolean} True if display name is valid
   */
  isValidDisplayName(displayName) {
    // Allow alphanumeric characters, hyphens, underscores, and spaces
    // Length between 3 and 20 characters
    const displayNameRegex = /^[a-zA-Z0-9_\- ]{3,20}$/;
    return displayNameRegex.test(displayName);
  },
  
  /**
   * Validate user registration data
   * @param {Object} userData User data to validate
   * @returns {Object} Validation result
   */
  validateUserRegistration(userData) {
    const { email, password, display_name } = userData;
    const errors = {};
    
    if (!email) {
      errors.email = 'Email is required';
    } else if (!this.isValidEmail(email)) {
      errors.email = 'Invalid email format';
    }
    
    if (!password) {
      errors.password = 'Password is required';
    }
    
    if (!display_name) {
      errors.display_name = 'Display name is required';
    } else if (!this.isValidDisplayName(display_name)) {
      errors.display_name = 'Display name must be 3-20 characters and can only contain letters, numbers, spaces, hyphens, and underscores';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },
  
  /**
   * Sanitize input to prevent XSS attacks
   * @param {string} input Input to sanitize
   * @returns {string} Sanitized input
   */
  sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },
  
  /**
   * Sanitize an object's string properties
   * @param {Object} obj Object to sanitize
   * @returns {Object} Sanitized object
   */
  sanitizeObject(obj) {
    const sanitized = {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = typeof obj[key] === 'string' 
          ? this.sanitizeInput(obj[key]) 
          : obj[key];
      }
    }
    
    return sanitized;
  }
};

module.exports = validators;
