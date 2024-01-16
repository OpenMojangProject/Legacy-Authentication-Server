// Load environment variables from a .env file
require('dotenv').config();

// Import required libraries
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const genRoutes = require('./routes/general'); // General routes
const authRoutes = require('./routes/authentication'); // Authentication routes
const admRoutes = require('./routes/omp/admin'); // OpenMojangProject admin routes
const fileUpload = require('express-fileupload');

// Automatic generation of password salt if not provided in environment variables
if (!process.env.PASSWORD_SALT) {
  require('bcrypt').genSalt(
    process.env.SALT_ROUNDS,
    (err, salt) => {
      if (!err) {
        console.log(salt);
      } else {
        console.log(err);
      }
      process.exit(0);
    }
  );
}

// Enable file uploads with specified limits
app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 4 * 1024 * 1024 * 1024, // 4GB max file size
  },
}));

// Configure middleware for JSON parsing
app.use(express.json());
app.use(bodyParser.json());

// Use morgan for logging HTTP requests
app.use(morgan(process.env.MORGAN));

if (process.env.WEB_ROUTES === 'true') {
  app.use('/web', express.static(__dirname + "/web"));
}

// Serve static files from /skins directory
if (process.env.SKIN_ROUTES === 'true') {
  app.use('/skins', express.static(__dirname + "/skins"));
}

// Configure trust proxy settings based on environment variable
if (process.env.TRUST_PROXY !== '0') {
  app.set('trust proxy', process.env.TRUST_PROXY);
}

// Rate limiting middleware to prevent abuse
const limiter = rateLimit({
  windowMs: 600000, // 10 minutes window
  max: 600, // Limit each IP to 1 request per 10 minutes
  message: {
    error: 'TooManyRequestsException',
    errorMessage: 'Too many requests from this IP, please try again later.',
  },
});
app.use(limiter);

// Define routes for various parts of the application
app.use(genRoutes); // General routes
app.use(authRoutes); // Authentication routes

if (process.env.ADMIN_ROUTES === 'true') {
  app.use('/admin', admRoutes); // OpenMojangProject specific admin routes
}

// Handle 404 errors (not found)
app.use(function (req, res, next) {
  res.status(404).json({
    error: 'Not Found',
    errorMessage: 'The server has not found anything matching the request URI',
  });
});

// Define the port for the server to listen on, defaulting to 3000
const PORT = process.env.PORT || 3000;

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
