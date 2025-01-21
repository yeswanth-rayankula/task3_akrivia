const bcrypt = require('bcryptjs');
const { generateAccessToken } = require('../../utils/jwtConfig');
const knex = require('knex');
const knexConfig = require('../../../knexfile');
const logger = require('../../../logger');

const db = knex(knexConfig.development);

const loginUser = async (identifier, password) => {
  try {
    const user = await db('users')
      .where('email', identifier)
      .orWhere('username', identifier)
      .first();

    if (!user) {
      logger.warn(`Login failed: User with identifier ${identifier} not found.`);
      throw new Error('User not found.');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      logger.warn(`Login failed: Invalid password for user ${identifier}.`);
      throw new Error('Invalid password.');
    }

    const token = generateAccessToken({
      name: user.username,
      email: user.email,
      id: user.user_id,
    });

    logger.info(`User ${user.username} logged in successfully.`);

    return {
      token,
      user: {
        name: user.username,
        email: user.email,
        id: user.user_id,
      },
    };
  } catch (error) {
    logger.error(`Error logging in user ${identifier}: ${error.message}`);
    throw new Error('Error logging in user');
  }
};

module.exports = { loginUser };
