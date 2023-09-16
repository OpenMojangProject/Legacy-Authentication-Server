const express = require('express');
const util = require('util');
const router = express.Router();
const database = require('../../utils/database');

// Promisify database functions for better code readability
const createUserAsync = util.promisify(database.users.createUser);
const getUserByUsernameAsync = util.promisify(database.users.getUserByUsername);
const addProfileAsync = util.promisify(database.profiles.addProfile);
const selectProfileAsync = util.promisify(database.profiles.selectProfile);
const checkProfileAsync = util.promisify(database.profiles.checkProfile);
const checkProfilesAsync = util.promisify(database.profiles.checkProfiles);

// Middleware to check the admin key
function checkAdminKey(req, res, next) {
  if (req.body.admin_key && req.body.admin_key === process.env.ADMIN_KEY) {
    next();
  } else {
    res.status(403).json({
      "error": "ForbiddenOperationException",
      "errorMessage": "Admin key (admin_key) is invalid or not provided."
    });
  }
}

// Create user
router.post('/create/user', checkAdminKey, async (req, res) => {
  try {
    const user = await createUserAsync(req.body.username, req.body.password, req.body.preferredLanguage, req.body.registrationCountry);

    res.status(200).json(user);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      res.status(403).json({
        "error": "ForbiddenOperationException",
        "errorMessage": "This user already exists in our database.",
      });
    } else {
      res.status(500).json(err);
    }
  }
});

// Create profile
router.post('/create/profile', checkAdminKey, async (req, res) => {
  try {
    const row = await addProfileAsync(req.body.username, req.body.owner);

    if (req.body.select) {
      await selectProfileAsync(row, req.body.owner);
    }

    res.status(200).json(row);
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      res.status(403).json({
        "error": "ForbiddenOperationException",
        "errorMessage": "This profile already exists in our database.",
      });
    } else {
      res.status(500).json(err);
    }
  }
});

// Find user
router.post('/find/user', checkAdminKey, async (req, res) => {
  try {
    const user = await getUserByUsernameAsync(req.body.username);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Find profile
router.post('/find/profile', checkAdminKey, async (req, res) => {
  try {
    const profile = await checkProfileAsync(req.body.uuid);
    res.status(200).json(profile);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Find profiles
router.post('/find/profiles', checkAdminKey, async (req, res) => {
  try {
    const profiles = await checkProfilesAsync(req.body.owner);
    res.status(200).json(profiles);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
