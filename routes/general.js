// Import the required libraries
const express = require('express');
const router = express.Router();

// Import configuration files
const mojangConfig = require('../config/mojang.json');
const authlibConfig = require('../config/authlib.json');

// Define a route to handle GET requests for authentication service configuration
router.get('/', (req, res) => {
    let responseData;

    // Generate a PEM public key for the authlib configuration
    authlibConfig.signaturePublickey = require('../utils/crypto').toPEMPublicKey();

    // Set a feature flag in the authlib configuration based on an environment variable
    process.env.FEATURE_NON_EMAIL_LOGIN === 'true' ? authlibConfig.meta["feature.non_email_login"] = true : null;

    // Determine the response data based on the API mode environment variable
    if (process.env.API_MODE === "mojang") {
        responseData = mojangConfig;
    }
    else if (process.env.API_MODE === "authlib") {
        responseData = authlibConfig;
    }
    else {
        responseData = { ...authlibConfig, ...mojangConfig };
    }

    // Send the response with the configured data as JSON
    res.status(200).json(responseData);
});

// Export the router for use in other parts of the application
module.exports = router;
