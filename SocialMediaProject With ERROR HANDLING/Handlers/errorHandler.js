module.exports = (err, req, res, next) => {
  // خلي defaults
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // لو احنا في development mode
  if (process.env.NODE_ENV === 'development') {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      error: err,
      stack: err.stack,
    });
  }

  // production mode
  // Operational, trusted error: نعرض رسالة واضحة
  if (err.name === 'CastError' || err.name === 'ValidationError') {
    return res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }

  // Programming or unknown error: رسالة عامة
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!',
  });
};
