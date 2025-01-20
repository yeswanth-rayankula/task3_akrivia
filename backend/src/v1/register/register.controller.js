const Joi = require('joi');
const { registerNewUser } = require('./register.service');

const registerSchema = Joi.object({
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

const registerUser = async (req, res) => {
  console.log('Registering new user:', req.body);
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const { first_name, last_name, email, password } = req.body;

  try {
    const newUser = await registerNewUser(first_name, last_name, email, password);
    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registerUser };
