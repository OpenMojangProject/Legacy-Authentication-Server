const { prisma } = require('../client');

// Function to add a profile to the database
async function addProfile(username, owner) {
    const profileExist = await checkProfile(username);

    if (!profileExist) {
        try {
            const query = await prisma.profile.create({
                data: {
                    username,
                    ownerId: owner
                }
            });

            return query;
        }
        catch (err) {
            console.error('Error adding profile:', err.message);
            return err;
        }
    }
    else {
        return { code: "Already exists" }
    }
}

// Function to check if a profile with a specific UUID exists
async function checkProfile(uuid, selected) {
    try {
        const query = await prisma.profile.findFirst({
            where: {
                id: uuid,
                selected
            }
        });

        return query;
    }
    catch (err) {
        return err;
    }
}

// Function to get a profile by its username
async function getProfileByName(username) {
    try {
        const query = await prisma.profile.findFirst({
            where: {
                username: username
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

// Function to check all profiles belonging to a specific owner
async function checkProfiles(owner) {
    try {
        const query = await prisma.user.findFirst({
            where: {
                username: owner
            },
            select: {
                profiles: true
            }
        });

        return query.profiles;
    }
    catch (err) {
        return err;
    }
}

// Function to select a profile for a user
async function selectProfile(uuid, owner) {
    try {
        await prisma.profile.updateMany({
            where: {
                ownerId: owner,
                selected: true
            },
            data: {
                selected: false
            }
        });

        const query = await prisma.profile.update({
            where: {
                id: uuid,
                ownerId: owner
            },
            data: {
                selected: true
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
    addProfile, // Function to add a profile
    checkProfile, // Function to check if a profile with a UUID exists
    getProfileByName, // Function to get a profile by its username
    checkProfiles, // Function to check all profiles belonging to an owner
    selectProfile // Function to select a profile for a user
};
