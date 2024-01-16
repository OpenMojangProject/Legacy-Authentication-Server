// Import required libraries
const bcrypt = require('bcrypt'); // Library for password hashing
const { prisma } = require('../client');

// Function to get a user by their username
async function getUserByUsername(value, special) {
    try {
        var isEmail = false;

        if (process.env.FEATURE_NON_EMAIL_LOGIN === 'true') {
            if (value.includes('@')) {
                isEmail = true;     
            }
        }

        const query = await prisma.user.findFirst({
            where: isEmail ? { email: value.toLowerCase() } : { username: value },
            select: {
                id: true,
                email: true,
                username: true,
                password: special,
                preferredLanguage: true,
                registrationCountry: true
            }
        });

        return query;
    }
    catch (err) {
        return err;
    }
}

// Function to get a user by their selected profile
async function getUserByProfile(value) {
    try {
        const query = await prisma.user.findFirst({
            where: {
                selectedProfile: value
            }
        });

        return query;
    }
    catch (err) {
        return err;
    }
}

// Function to create a new user
async function createUser(email, username, password, preferredLanguage, registrationCountry) {
    try {
        const query = await prisma.user.create({
            data: {
                email: email,
                username: username,
                password: bcrypt.hashSync(password, process.env.PASSWORD_SALT),
                preferredLanguage: preferredLanguage,
                registrationCountry: registrationCountry,
            },
            select: {
                id: true,
                email: true,
                username: true,
                preferredLanguage: true,
                registrationCountry: true
            }
        });

        return query;
    }
    catch (err) {
        return err;
    }
}

// Function to update a user's password
async function updatePassword(username, password) {
    try {
        const query = await prisma.user.update({
            where: {
                username: username
            },
            data: {
                password: bcrypt.hashSync(password, process.env.PASSWORD_SALT)
            }
        });

        if (query.id) {
            return query;
        }
    }
    catch (err) {
        return err;
    }
}

// Export the functions for use in other parts of the application
module.exports = {
    getUserByUsername, // Function to get a user by username
    getUserByProfile, // Function to get a user by selected profile
    createUser, // Function to create a new user
    updatePassword, // Function to update a user's password
};
