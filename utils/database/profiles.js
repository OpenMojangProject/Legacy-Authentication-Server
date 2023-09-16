// Import required libraries
const jwt = require('jsonwebtoken'); // Library for JSON Web Tokens
const { generateUUIDWithoutHyphens } = require('../common'); // Custom function to generate UUID without hyphens

// Import the SQLite3 library
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DB_FILE); // Create a database connection

// Function to add a profile to the database
function addProfile(username, owner, callback) {
    const insertQuery = 'INSERT INTO profiles (username, uuid, owner) VALUES (?, ?, ?)';
    const uuid = generateUUIDWithoutHyphens(); // Generate a UUID for the profile

    // Check if a profile with the same username exists
    checkProfile(username, (err, profile) => {
        if (err || !profile) {
            // If no profile with the same username exists, insert the new profile
            db.run(insertQuery, [username, uuid, owner], (err) => {
                if (err) {
                    console.error('Error adding profile:', err.message);
                    callback(err, null);
                } else {
                    callback(false, uuid); // Callback with the generated UUID
                }
            });
        } else {
            callback("Already exists", null); // Callback with an error message
        }
    });
}

// Function to check if a profile with a specific UUID exists
function checkProfile(uuid, callback) {
    const query = 'SELECT * FROM profiles WHERE uuid = ?';

    db.get(query, [uuid], (err, row) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, row);
        }
    });
}

// Function to get a profile by its username
async function getProfileByName(username, callback) {
    const query = 'SELECT * FROM profiles WHERE username = ?';

    db.get(query, [username], (err, row) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, row);
        }
    });
}

// Function to check all profiles belonging to a specific owner
function checkProfiles(owner, callback) {
    const query = 'SELECT * FROM profiles WHERE owner = ?';

    db.all(query, [owner], (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}

// Function to select a profile for a user
function selectProfile(uuid, owner, callback) {
    const query = 'UPDATE users SET selectedProfile = ? WHERE username = ?';

    db.run(query, [uuid, owner], err => {
        if (err) {
            callback(err);
        } else {
            callback(true);
        }
    });
}

// Export the functions for use in other parts of the application
module.exports = {
    addProfile, // Function to add a profile
    checkProfile, // Function to check if a profile with a UUID exists
    getProfileByName, // Function to get a profile by its username
    checkProfiles, // Function to check all profiles belonging to an owner
    selectProfile // Function to select a profile for a user
};
