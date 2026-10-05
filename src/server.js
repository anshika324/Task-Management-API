require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

['MONGO_URI', 'JWT_SECRET'].forEach((key) => {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 5001;

const start = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.on('error', (err) => {
    console.error('Server failed to start:', err.message);
    process.exit(1);
  });
};

start();