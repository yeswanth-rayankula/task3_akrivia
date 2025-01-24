const Joi = require('joi');
exports.registerSchema = Joi.object({
    first_name: Joi.string().min(1).required().messages({
      'string.min': 'First name cannot be empty.',
      'any.required': 'First name is required.',
    }),
    last_name: Joi.string().min(1).required().messages({
      'string.min': 'First name cannot be empty.',
      'any.required': 'First name is required.',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Invalid email format.',
      'any.required': 'Email is required.',
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Password must be at least 6 characters long.',
      'any.required': 'Password is required.',
    }),
  });