// Import the SQLite3 library
const sqlite3 = require('sqlite3').verbose();

// Create a new database connection or open an existing one based on the DB_FILE environment variable
const db = new sqlite3.Database(process.env.DB_FILE);

// Import modules for handling database operations related to users, sessions, and profiles
const users = require("./database/users");
const sessions = require("./database/sessions");
const profiles = require("./database/profiles");

// Import a migration module for email migration if the relevant environment variables are set
const migrate = require("./database/migration");

// Function to create the database tables (if they don't exist)
function createTables() {
  // Define SQL queries for creating database tables
  const tableQueries = [
    // Create the 'users' table
    `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      userId TEXT NOT NULL,
      preferredLanguage TEXT NOT NULL,
      registrationCountry TEXT NOT NULL,
      selectedProfile INTEGER UNIQUE
    )
    `,
    // Create the 'admins' table
    `
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
    `,
    // Create the 'sessions' table
    `
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL,
      jwt TEXT NOT NULL,
      yggt TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      valid INTEGER DEFAULT 1
    )
    `,
    // Create the 'profiles' table
    `
    CREATE TABLE IF NOT EXISTS profiles (
      id INTEGER PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      uuid TEXT NOT NULL UNIQUE,
      owner TEXT NOT NULL
    )
    `
  ];

  // If email migration environment variables are set, perform email migration
  if (process.env.MIGRATION_EMAIL_OLD_DOMAIN && process.env.MIGRATION_EMAIL_NEW_DOMAIN) {
    migrate.migrateEmails(process.env.MIGRATION_EMAIL_OLD_DOMAIN, process.env.MIGRATION_EMAIL_NEW_DOMAIN);
  }

  // Execute each table creation query
  tableQueries.forEach(query => {
    db.run(query, err => {
      if (err) {
        console.error('Error creating table:', err.message);
      }
    });
  });
}

// Function to close the database connection
function closeConnection(callback) {
  db.close(err => {
    if (err) {
      console.error('Error closing the database connection:', err.message);
      return callback(err);
    }
    callback(null, 'Closed the database connection.');
  });
}

// Export database connection and related modules/functions
module.exports = {
  db,
  users,
  sessions,
  profiles,
  createTables,
  closeConnection
};
