const bcrypt = require('bcryptjs');
const knex = require('knex');
const knexConfig = require('../../../knexfile');
const logger = require('../../../logger');

const db = knex(knexConfig.development);

const registerNewUser = async (first_name, last_name, email, password) => {
  try {
    logger.info('Registering new user:', { first_name, last_name, email });

    const existingUser = await db('users').where({ email }).first();
    if (existingUser) {
      logger.warn(`User with email ${email} already exists.`);
      throw new Error('User with this email already exists.');
    }

    let baseUsername = `${first_name}`.toLowerCase();
    let username = baseUsername;
    let counter = 1;

    while (await db('users').where({ username }).first()) {
      username = `${baseUsername}${counter}`;
      counter++;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const status = 'inactive';

    const [userId] = await db('users').insert({
      first_name,
      username,
      email,
      password: hashedPassword,
      status: 1,
      created_at: db.fn.now(),
      updated_at: db.fn.now(),
    });

    const newUser = await db('users').where({ user_id: userId }).first();

    logger.info('New user registered:', newUser);
    return newUser;
  } catch (error) {
    logger.error('Error registering new user:', error.message);
    throw new Error(error.message || 'Error registering new user');
  }
};

module.exports = { registerNewUser };
