const { registerNewUser } = require('./register.service');
const { registerSchema } = require('./register.utils');
const knex = require('knex');
const knexConfig = require('../../../knexfile');
const db = knex(knexConfig.development);

const registerUser = async (req, res,next) => {
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
    err.statusCode=401;
    
    next(err);
  }
};
const getLocations = async (req, res,next) => {
  try {
    const locations = await db('locations').select('*'); 
    res.status(200).json({ success: true, data: locations });
} catch (error) {
    logger.error('Error fetching locations:', error);
    res.status(400).json({message:"location fetch error"})
}
};

module.exports = { registerUser,getLocations };
