// Import required libraries
const sqlite3 = require('sqlite3').verbose(); // SQLite3 for database operations
const bcrypt = require('bcrypt'); // Library for password hashing
const common = require('../common'); // Custom functions (e.g., UUID generation)
const db = new sqlite3.Database(process.env.DB_FILE); // Create a database connection

// Function to get a user by their username
function getUserByUsername(value, callback) {
    const query = `SELECT * FROM users WHERE username = ?`;

    db.get(query, [value], (err, row) => {
        if (err) {
            console.error('Error:', err.message);
            return callback(err);
        }

        callback(null, row); // Pass the user data back through the callback
    });
}

// Function to get a user by their selected profile
function getUserByProfile(value, callback) {
    const query = `SELECT * FROM users WHERE selectedProfile = ?`;

    db.get(query, [value], (err, row) => {
        if (err) {
            console.error('Error:', err.message);
            return callback(err);
        }

        callback(null, row); // Pass the user data back through the callback
    });
}

// Function to create a new user
function createUser(username, password, preferredLanguage, registrationCountry, callback) {
    const insertQuery = `
      INSERT INTO users (email, username, password, userId, preferredLanguage, registrationCountry)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    // Hash the password before inserting it into the database
    db.run(
        insertQuery,
        [
            username,
            username,
            bcrypt.hashSync(password, process.env.PASSWORD_SALT), // Hash the password
            common.generateUUIDWithoutHyphens(), // Generate a UUID for the user
            preferredLanguage,
            registrationCountry,
        ],
        (err, row) => {
            if (err) {
                return callback(err);
            }

            callback(null, row);
        }
    );
}

// Function to update a user's password
function updatePassword(username, password, callback) {
    const query = `
    UPDATE users
    SET password = ?
    WHERE username = ?
    `;

    // Hash the new password before updating it in the database
    db.run(query, [bcrypt.hashSync(password, process.env.PASSWORD_SALT), username], err => {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
}

// Export the functions for use in other parts of the application
module.exports = {
    getUserByUsername, // Function to get a user by username
    getUserByProfile, // Function to get a user by selected profile
    createUser, // Function to create a new user
    updatePassword, // Function to update a user's password
};
