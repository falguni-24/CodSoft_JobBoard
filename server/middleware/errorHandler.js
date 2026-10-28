const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.error('[Error Details]:', err);
  }

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id: ${err.value}`;
    return res.status(404).json({ success: false, message });
  }

  // Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    let message = `A record with this ${field} already exists.`;
    if (field === 'jobId' || field === 'candidateId') {
      message = 'You have already submitted an application for this job.';
    }
    return res.status(409).json({ success: false, message });
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
    return res.status(400).json({ success: false, message });
  }

  // Multer Error (e.g., file size limit)
  if (err.name === 'MulterError') {
    let message = `File upload error: ${err.message}`;
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = 'File size limit exceeded. Maximum file size is 5MB.';
    }
    return res.status(400).json({ success: false, message });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token. Please authenticate.' });
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Your session has expired. Please log in again.' });
  }

  // Default server error
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Internal Error',
  });
};

module.exports = errorHandler;
