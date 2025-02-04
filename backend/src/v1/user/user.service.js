const knex = require('knex');
const knexConfig = require('../../../knexfile');
const logger = require('../../../logger');

const db = knex(knexConfig.development);

const getUserById = async (id) => {
  try {
    const user = await db('users').where({ user_id: id }).first();

    if (!user) {
      logger.warn(`User with ID ${id} not found.`);
    }

    return user;
  } catch (error) {
    logger.error('Error fetching user data:', error.message);
    throw new Error('Error fetching user data');
  }
};
const getAllUser = async () => {
  try {
    const user = await db('users').select('user_id', 'username', 'profile_pic');;

    if (!user) {
      logger.warn(`User with ID ${id} not found.`);
    }

    return user;
  } catch (error) {
    logger.error('Error fetching user data:', error.message);
    throw new Error('Error fetching user data');
  }
};

const updateUser = async (userId, updatedData) => {
  try {
     console.log(updatedData);
    const updatedUser = await db('users')
      .where({ user_id: userId })
      .update(updatedData, ['user_id', 'username', 'email', 'profile_pic']);

    if (!updatedUser) {
      logger.warn(`User with ID ${userId} not found for update.`);
      throw new Error('User not found');
    }

    logger.info(`User with ID ${userId} successfully updated.`);
    return updatedUser[0];
  } catch (error) {
    logger.error('Error updating user:', error.message);
    if (error.stack) {
      logger.error('Stack trace:', error.stack);
    }

    throw new Error('Error updating user');
  }
};

module.exports = { getUserById, updateUser,getAllUser };
