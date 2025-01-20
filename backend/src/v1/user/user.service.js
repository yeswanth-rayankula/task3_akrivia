const knex = require('knex');
const knexConfig = require('../../../knexfile');

const db = knex(knexConfig.development);
const getUserById = async (id) => {
  
  try {
    const user = await db('users').where({ user_id:id }).first();
 
    return user;
  } catch (error) {
    throw new Error('Error fetching user data');
  }
};
const updateUser = async (userId, updatedData) => {
  try {
    const updatedUser = await db('users')
      .where({ user_id: userId })
      .update(updatedData, ['user_id', 'username', 'email', 'profile_pic']); // Include profilePic in the returned columns

    if (!updatedUser) {
      throw new Error('User not found');
    }
    return updatedUser[0]; // Return the updated user
  } catch (error) {
    // Safely log the error by extracting the message and stack trace only
    console.error('Error updating user:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }

    // Throw a new error without including the circular structure
    throw new Error('Error updating user');
  }
};




module.exports = { getUserById,updateUser };
