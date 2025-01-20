const Joi = require('joi');
const { loginUser } = require('./login.service');


const loginUserHandler = async (req, res) => {
 



  const { identifier, password } = req.body;
  
  try {
    const { token, user } = await loginUser(identifier, password);
    res.status(200).json({ message: 'User logged in successfully', token, user });
  } catch (err) {
    res.status(401).send(err.message);
  }
};

module.exports = { loginUserHandler };
