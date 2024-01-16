// Import required libraries
const jwt = require('jsonwebtoken'); // Library for JSON Web Tokens
const { generateUUIDWithoutHyphens } = require('../common'); // Custom function to generate UUID without hyphens
const { prisma } = require('../client');
const { getUserByUsername } = require('./users');

// Function to delete old sessions for a user (keeping the latest one)
async function deleteOldSessions(username) {
    try {
        const session = await prisma.session.findFirst({ where: { username: username }, orderBy: { created_at: "desc" }, take: 1 });

        const query = await prisma.session.updateMany({
            where: {
                id: {
                    not: session?.id
                }
            },
            data: {
                valid: false
            }
        });

        if (query.id) {
            return null;
        }
    }
    catch (err) {
        console.error('Error deleting old sessions:', err.message);
        return err;
    }
}

// Function to invalidate a token by setting its validity to 0
async function invalidateToken(token) {
    try {
        const query = await prisma.session.update({
            where: {
                jwt: token
            },
            data: {
                valid: false
            }
        });

        if (query.id) {
            return !query.valid;
        }
    }
    catch (err) {
        console.error('Error invalidating token:', err.message);
        return err;
    }
}

// Function to add a new session for a user
async function addSession(username) {
    const yggt = generateUUIDWithoutHyphens();

    const user = getUserByUsername(username);

    if (user) {
        const data = {
            "agg": "Adult",
            "sub": user.id,
            "yggt": yggt,
            "iss": "Yggdrasil-Auth"
        };

        const token = jwt.sign(data, process.env.JWT_SECRET);

        try {
            await prisma.session.create({
                data: {
                    username: username,
                    jwt: token,
                    yggt: yggt
                }
            });

            return token;
        }
        catch (err) {
            console.error('Error adding session:', err.message);
            return err;
        }
    }
}

// Function to create a new session for a user (delete old sessions and add a new one)
async function createNewSession(username) {
    await deleteOldSessions(username);
    const session = await addSession(username);

    return session;
}

// Function to check the validity of a session token
async function checkSession(token) {
    try {
        const query = await prisma.session.findFirst({
            where: {
                jwt: token,
                valid: true
            }
        });

        return query;
    }
    catch (err) {
        return err;
    }
}

// Export the functions for use in other parts of the application
module.exports = {
    deleteOldSessions, // Function to delete old sessions
    invalidateToken, // Function to invalidate a token
    createNewSession, // Function to create a new session
    checkSession // Function to check the validity of a session token
};
