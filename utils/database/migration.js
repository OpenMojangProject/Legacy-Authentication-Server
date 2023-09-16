// Import the SQLite3 library
const sqlite3 = require('sqlite3').verbose();

// Create a new database connection or open an existing one based on the DB_FILE environment variable
const db = new sqlite3.Database(process.env.DB_FILE);

// Function to migrate email addresses from the old domain to the new domain for specific users
function migrateEmails(oldDomain, newDomain) {
    // Define SQL queries for selecting and updating user records
    const selectQuery = 'SELECT id, email FROM users WHERE username LIKE ?';
    const updateEmailQuery = 'UPDATE users SET email = ? WHERE id = ?';
    const updateUsernameQuery = 'UPDATE users SET username = ? WHERE id = ?';

    // Execute the selectQuery to find users with email addresses matching the old domain
    db.all(selectQuery, ['%@' + oldDomain + '%'], (err, rows) => {
        if (err) {
            console.error('Error selecting email addresses:', err.message);
            return;
        }

        // Iterate through the selected user records
        rows.forEach(row => {
            // Create a regular expression to match the old domain in email addresses
            const regex = new RegExp(`@${oldDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');

            // Replace the old domain with the new domain in the email address
            const newEmail = row.email.replace(regex, '@' + newDomain);

            // Update the user's email address in the database
            db.run(updateEmailQuery, [newEmail, row.id], err => {
                if (err) {
                    console.error('Error migrating user:', err.message);
                } else {
                    // Update the username to match the new email address (if needed)
                    db.run(updateUsernameQuery, [newEmail, row.id], err => {
                        if (err) {
                            console.error('Error migrating user:', err.message);
                        } else {
                            // Log the successful migration
                            console.log(`Migration successful for user ID ${row.id}: ${row.email} -> ${newEmail}`);
                        }
                    });
                }
            });
        });
    });
}

// Export the function for use in other parts of the application
module.exports = {
    migrateEmails
};