const bcrypt = require('bcryptjs');
const { generateAccessToken } = require('../../utils/jwtConfig');
const knex = require('knex');
const knexConfig = require('../../../knexfile');

const db = knex(knexConfig.development);

const loginUser = async (identifier, password) => {
  try {
   
    const user = await db('users')
      .where('email', identifier)
      .orWhere('username', identifier)
      .first();

    if (!user) {
      throw new Error('User not found.');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid password.');
    }

    const token = generateAccessToken({
      name: user.username,
      email: user.email,
      id: user.user_id,
    });

    return {
      token,
      user: {
        name: user.username,
        email: user.email,
        id: user.user_id,
      },
    };
  } catch (error) {
    console.error('Error logging in user:', error);
    throw new Error('Error logging in user');
  }
};

module.exports = { loginUser };
