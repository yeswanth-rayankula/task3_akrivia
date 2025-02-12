
const { loginUser } = require('./login.service');
const { loginUserSchema } = require('./login.utils');


const loginUserHandler = async (req, res,next) => {
  const { error } = loginUserSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
   const { identifier, password } = req.body;
   
  try {
    const { token,rtoken, user } = await loginUser(identifier, password);
    res.status(200).json({ message: 'User logged in successfully', token,rtoken, user });
  } catch (err) {
     
      err.statusCode=401;
      console.log(err);
      next(err);
    
  }
};

module.exports = { loginUserHandler };
