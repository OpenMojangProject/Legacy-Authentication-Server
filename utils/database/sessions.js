// Import required libraries
const jwt = require('jsonwebtoken'); // Library for JSON Web Tokens
const { generateUUIDWithoutHyphens } = require('../common'); // Custom function to generate UUID without hyphens

// Import the SQLite3 library
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DB_FILE); // Create a database connection

// Function to delete old sessions for a user (keeping the latest one)
function deleteOldSessions(username, callback) {
    const query = `
      UPDATE sessions
      SET valid = 0
      WHERE id NOT IN (
        SELECT id
        FROM sessions
        WHERE username = ?
        ORDER BY created_at DESC
        LIMIT 1
      )
    `;

    db.run(query, [username], err => {
        if (err) {
            console.error('Error deleting old sessions:', err.message);
            callback(err);
        } else {
            callback(null);
        }
    });
}

// Function to invalidate a token by setting its validity to 0
function invalidateToken(token, callback) {
    const query = `
      UPDATE sessions
      SET valid = 0
      WHERE jwt = ?
    `;

    db.run(query, [token], err => {
        if (err) {
            console.error('Error invalidating token:', err.message);
            callback(err);
        } else {
            callback(true);
        }
    });
}

// Function to add a new session for a user
function addSession(username, callback) {
    const insertQuery = 'INSERT INTO sessions (username, jwt, yggt) VALUES (?, ?, ?)';
    const yggt = generateUUIDWithoutHyphens(); // Generate a UUID for yggt

    require('./users').getUserByUsername(username, (err, user) => {
        const data = {
            "agg": "Adult",
            "sub": user.userId,
            "yggt": yggt,
            "iss": "Yggdrasil-Auth"
        };

        // Generate a JSON Web Token (JWT) for the session
        const token = jwt.sign(data, process.env.JWT_SECRET);

        // Insert the session into the database
        db.run(insertQuery, [username, token, yggt], (err) => {
            if (err) {
                console.error('Error adding session:', err.message);
                callback(err, null);
            } else {
                callback(false, token); // Callback with the generated JWT
            }
        });
    });
}

// Function to create a new session for a user (delete old sessions and add a new one)
function createNewSession(username, callback) {
    deleteOldSessions(username, err => {
        if (err) {
            callback(err);
        }
        else {
            addSession(username, (addErr, token) => {
                if (addErr) {
                    callback(addErr);
                }
                else {
                    callback(false, token);
                }
            });
        }
    });
}

// Function to check the validity of a session token
function checkSession(token, callback) {
    const query = `
      SELECT * FROM sessions WHERE jwt = ?
    `;

    db.get(query, [token], (err, row) => {
        if (err) {
            callback(err, null);
        } else if (row && row.valid === 1) {
            // Token is valid
            callback(null, row);
        } else {
            // Token is not valid
            callback(null, row);
        }
    });
}

// Export the functions for use in other parts of the application
module.exports = {
    deleteOldSessions, // Function to delete old sessions
    invalidateToken, // Function to invalidate a token
    createNewSession, // Function to create a new session
    checkSession // Function to check the validity of a session token
};
