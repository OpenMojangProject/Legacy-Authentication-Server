// Import required libraries and modules
const bcrypt = require('bcrypt'); // Library for password hashing
const express = require('express');
const router = express.Router();
const { checkProfile, checkProfiles } = require('../utils/database/profiles');
const { createNewSession, checkSession, invalidateToken } = require('../utils/database/sessions');
const { getUserByUsername, updatePassword } = require('../utils/database/users');

// Helper function to authorize a user and create a session
async function authorize(user) {
  try {
    // Create a new session token
    const token = await createNewSession(user.username);
    
    // Fetch user profiles and the selected profile
    const profiles = await checkProfiles(user.username);
    const profileList = profiles.map(profile => ({ name: profile.username, id: profile.id }));
    var selectedProfile = profiles.find(profile => profile.selected === true);

    selectedProfile = selectedProfile
      ? { name: selectedProfile.username, id: selectedProfile.id }
      : {};

    return {
      user: {
        username: user.username,
        properties: [
          { name: 'preferredLanguage', value: user.preferredLanguage },
          { name: 'registrationCountry', value: user.registrationCountry }
        ],
        id: user.id
      },
      accessToken: token,
      availableProfiles: profileList,
      selectedProfile
    };
  } catch (err) {
    console.error(err);

    throw {
      error: 'ForbiddenOperationException',
      errorMessage: 'Invalid credentials. Invalid username or password.'
    };
  }
}

// Helper function for final user authentication
async function finalAuth(req, res, username) {
  try {
    const user = await getUserByUsername(username, true);

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
    return res.status(403).json({
      error: 'ForbiddenOperationException',
      errorMessage: 'Invalid credentials. Invalid username or password.'
    });
  }
}

// Route to handle user authentication
router.post('/authenticate', async (req, res) => {
  if (req.body.username && req.body.password) {
    let username = req.body.username;

    // Perform final user authentication
    finalAuth(req, res, username);
  }
});

// Route to handle changing the user's password
router.post('/changePassword', async (req, res) => {
  try {
    // Check the validity of the provided access token
    const row = await checkSession(req.body.accessToken);

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
    await updatePassword(row.username, req.body.newPassword);

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
    const row = await checkSession(req.body.accessToken);

    if (!row || row.valid === 0) {
      return res.status(403).json({
        error: 'ForbiddenOperationException',
        errorMessage: 'Invalid token'
      });
    }

    // Get the user by username and authorize them with a new session
    const user = await getUserByUsername(row.username);
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
    const row = await checkSession(req.body.accessToken);

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
router.post(['/invalidate', '/signout'], async (req, res) => {
  try {
    // Invalidate (delete) the provided access token
    await invalidateToken(req.body.accessToken);

    // Send a 204 (No Content) response indicating success
    return res.status(204).send();
  } catch (err) {
    return res.status(403).json(err);
  }
});

// Export the router for use in other parts of the application
module.exports = router;
