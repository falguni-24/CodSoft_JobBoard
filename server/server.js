const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start listening
const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(
      `==================================================\n` +
      `  JobConnect Server running on port ${PORT}\n` +
      `  Environment: ${process.env.NODE_ENV || 'development'}\n` +
      `  API Health:  http://localhost:${PORT}/api/health\n` +
      `==================================================`
    );
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`Unhandled Rejection Error: ${err.message}`);
  });
};

startServer();
