const Joi = require('joi');


exports.loginUserSchema = Joi.object({
  identifier: Joi.string().required().min(3).max(255),
  password: Joi.string().required().min(6), 
});

