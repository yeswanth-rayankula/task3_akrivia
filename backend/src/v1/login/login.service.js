const bcrypt = require('bcryptjs');
const { generateAccessToken, generateRefreshToken } = require('../../utils/jwtConfig');
const knex = require('knex');
const knexConfig = require('../../../knexfile');
const logger = require('../../../logger');
const db = knex(knexConfig.development);
const { Model } = require('objection');
Model.knex(db)

const User=require('./../../../model/user');
const Department=require('./../../../model/Department.js');
const Employee = require('../../../model/Employee.js');
const loginUser = async (identifier, password) => {
  console.log(identifier)
  try {
 
    const data=await Department.query().findById(1).withGraphFetched('employees');
    console.log(data)
    const user = await User.query()
    .where('email', identifier)

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
      role:user.role
    });
    const rtoken = generateRefreshToken({
      name: user.username,
      email: user.email,
      id: user.user_id,
      role:user.role
    });

    logger.info(`User ${user.username} logged in successfully.`);
     console.log(rtoken);
    return {
      token,
      rtoken,
      user: {
        name: user.username,
        email: user.email,
        id: user.user_id,
      },
    };
  } catch (error) {
    logger.error(`Error logging in user ${identifier}: ${error.message}`);
    throw new Error(error.message);
  }
};

module.exports = { loginUser };
