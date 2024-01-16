const express = require('express');
const router = express.Router();
const { createUser, getUserByUsername } = require('../../utils/database/users');
const { addProfile, selectProfile, checkProfiles, checkProfile } = require('../../utils/database/profiles');

// Middleware to check the admin key
function checkAdminKey(req, res, next) {
  console.log(req);

  if (req.headers["authorization"] && req.headers["authorization"] === process.env.ADMIN_KEY) {
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
    const user = await createUser(req.body.email, req.body.username, req.body.password, req.body.preferredLanguage, req.body.registrationCountry);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Create profile
router.post('/create/profile', checkAdminKey, async (req, res) => {
  try {
    const profile = await addProfile(req.body.username, req.body.owner);

    if (req.body.select) {
      await selectProfile(profile.id, req.body.owner);
    }

    res.status(200).json(profile);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Select profile
router.post('/select/profile', checkAdminKey, async (req, res) => {
  try {
    const profile = await selectProfile(req.body.id, req.body.owner);
    res.status(200).json(profile);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Find user
router.post('/find/user', checkAdminKey, async (req, res) => {
  try {
    const user = await getUserByUsername(req.body.username);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Find profile
router.post('/find/profile', checkAdminKey, async (req, res) => {
  try {
    const profile = await checkProfile(req.body.uuid);
    res.status(200).json(profile);
  } catch (err) {
    res.status(400).json(err);
  }
});

// Find profiles
router.post('/find/profiles', checkAdminKey, async (req, res) => {
  try {
    const profiles = await checkProfiles(req.body.owner);
    res.status(200).json(profiles);
  } catch (err) {
    res.status(400).json(err);
  }
});

module.exports = router;
