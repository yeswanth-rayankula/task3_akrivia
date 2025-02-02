exports.notFoundHandler = (req, res, next) => {
    res.status(404).json({
      success: false,
      error: {
        code: 404,
        message: 'Resource not found',
      },
    });
  };
  exports.errorHandler = (err, req, res, next) => {
    

    const statusCode = err.statusCode ; 
    const message = err.message ;
    console.log(statusCode,message);
   
    res.status(statusCode).json({
      success: false,
      error: {
        code: statusCode,
        message: message,
      },
    });
  };
  
  