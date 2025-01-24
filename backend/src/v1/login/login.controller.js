
const { loginUser } = require('./login.service');
const { loginUserSchema } = require('./login.utils');


const loginUserHandler = async (req, res) => {
  const { error } = loginUserSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
   const { identifier, password } = req.body;
  
  try {
    const { token, user } = await loginUser(identifier, password);
    res.status(200).json({ message: 'User logged in successfully', token, user });
  } catch (err) {
    res.status(401).send(err.message);
  }
};

module.exports = { loginUserHandler };
