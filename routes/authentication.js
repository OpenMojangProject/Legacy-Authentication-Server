// Import required libraries and modules
const bcrypt = require('bcrypt'); // Library for password hashing
const express = require('express');
const router = express.Router();
const database = require('../utils/database'); // Module for database operations
const util = require('util'); // Utility module for promisifying functions

// Promisify database functions for better code readability
const createNewSessionAsync = util.promisify(database.sessions.createNewSession);
const checkProfilesAsync = util.promisify(database.profiles.checkProfiles);
const checkProfileAsync = util.promisify(database.profiles.checkProfile);
const getUserByUsernameAsync = util.promisify(database.users.getUserByUsername);
const checkSessionAsync = util.promisify(database.sessions.checkSession);
const invalidateTokenAsync = util.promisify(database.sessions.invalidateToken);
const getProfileByNameAsync = util.promisify(database.profiles.getProfileByName);
const updatePasswordAsync = util.promisify(database.users.updatePassword);

// Helper function to authorize a user and create a session
async function authorize(user) {
  try {
    // Create a new session token
    const token = await createNewSessionAsync(user.username);
    
    // Fetch user profiles and the selected profile
    const profiles = await checkProfilesAsync(user.username);
    const profileList = profiles.map(profile => ({ name: profile.username, id: profile.uuid }));
    const profile = await checkProfileAsync(user.selectedProfile);

    const selectedProfile = profile
      ? { name: profile.username, id: profile.uuid }
      : {};

    return {
      user: {
        username: user.username,
        properties: [
          { name: 'preferredLanguage', value: user.preferredLanguage },
          { name: 'registrationCountry', value: user.registrationCountry }
        ],
        id: user.userId
      },
      accessToken: token,
      availableProfiles: profileList,
      selectedProfile
    };
  } catch (err) {
    throw {
      error: 'ForbiddenOperationException',
      errorMessage: 'Invalid credentials. Invalid username or password.'
    };
  }
}

// Helper function for final user authentication
async function finalAuth(req, res, username) {
  try {
    const user = await getUserByUsernameAsync(username);

    // Check if the user exists and the password is valid
    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(403).json({
        error: 'ForbiddenOperationException',
        errorMessage: 'Invalid credentials. Invalid username or password.'
      });
    }

    // Authorize the user and create a session
    const authorizedUser = await authorize(user);
    return res.status(200).json(authorizedUser);
  } catch (err) {
    return res.status(403).json(err);
  }
}

// Route to handle user authentication
router.post('/authenticate', async (req, res) => {
  if (req.body.username && req.body.password) {
    let username = req.body.username;
    
    // Handle non-email login if enabled
    if (process.env.FEATURE_NON_EMAIL_LOGIN === 'true') {
      if (!username.includes('@')) {
        try {
          const user = await getProfileByNameAsync(username);
          username = user?.owner;
        } catch (err) {
          return res.status(403).json({
            error: 'ForbiddenOperationException',
            errorMessage: 'Invalid credentials. Invalid username or password.'
          });
        }
      }
    }

    // Perform final user authentication
    finalAuth(req, res, username);
  }
});

// Route to handle changing the user's password
router.post('/changePassword', async (req, res) => {
  try {
    // Check the validity of the provided access token
    const row = await checkSessionAsync(req.body.accessToken);

    if (!row || row.valid === 0) {
      return res.status(403).json({
        error: 'ForbiddenOperationException',
        errorMessage: 'Invalid token'
      });
    }

    // Check if a new password is provided
    if (!req.body.newPassword) {
      return res.status(403).json({
        error: 'ForbiddenOperationException',
        errorMessage: 'No new password supplied'
      });
    }

    // Update the user's password with the new one
    await updatePasswordAsync(row.username, req.body.newPassword);

    return res.status(200).json({
      "message": "Password updated"
    });
  } catch (err) {
    return res.status(403).json(err);
  }
});

// Route to refresh an access token
router.post('/refresh', async (req, res) => {
  try {
    // Check the validity of the provided access token
    const row = await checkSessionAsync(req.body.accessToken);

    if (!row || row.valid === 0) {
      return res.status(403).json({
        error: 'ForbiddenOperationException',
        errorMessage: 'Invalid token'
      });
    }

    // Get the user by username and authorize them with a new session
    const user = await getUserByUsernameAsync(row.username);
    const authorizedUser = await authorize(user);

    return res.status(200).json(authorizedUser);
  } catch (err) {
    return res.status(403).json(err);
  }
});

// Route to validate an access token
router.post('/validate', async (req, res) => {
  try {
    // Check the validity of the provided access token
    const row = await checkSessionAsync(req.body.accessToken);

    if (!row || row.valid === 0) {
      return res.status(403).json({
        error: 'ForbiddenOperationException',
        errorMessage: 'Invalid token'
      });
    }

    // Send a 204 (No Content) response if the token is valid
    return res.status(204).send();
  } catch (err) {
    return res.status(403).json(err);
  }
});

// Route to invalidate (sign out) an access token
router.post('/invalidate', async (req, res) => {
  try {
    // Invalidate (delete) the provided access token
    await invalidateTokenAsync(req.body.accessToken);

    // Send a 204 (No Content) response indicating success
    return res.status(204).send();
  } catch (err) {
    return res.status(403).json(err);
  }
});

// Route to sign out (invalidate) an access token (same as /invalidate)
router.post('/signout', async (req, res) => {
  try {
    // Invalidate (delete) the provided access token
    await invalidateTokenAsync(req.body.accessToken);

    // Send a 204 (No Content) response indicating success
    return res.status(204).send();
  } catch (err) {
    return res.status(403).json(err);
  }
});

// Export the router for use in other parts of the application
module.exports = router;
