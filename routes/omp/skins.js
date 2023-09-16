const express = require('express');
const util = require('util');
const database = require('../../utils/database');
const router = express.Router();

// Promisify the database function for better code readability
const checkSessionAsync = util.promisify(database.sessions.checkSession);

router.post('/upload', async (req, res) => {
    try {
        // Check the validity of the provided access token
        const row = await checkSessionAsync(req.headers.authorization.split(' ')[1]);

        if (!row || row.valid === 0) {
            // If the token is invalid, return an error response
            res.status(500).send({
                error: 'ForbiddenOperationException',
                errorMessage: 'Invalid token'
            });
        } else {
            if (!req.files) {
                // If no files were uploaded, return an error response
                res.send({
                    status: false,
                    message: 'No file uploaded'
                });
            } else {
                let skin = req.files.skin;

                if (skin.mimetype.includes("image/")) {
                    // If the uploaded file has a valid image mimetype (e.g., image/png),
                    // save it to the 'skins' directory with a unique filename
                    const file = 'skins/' + req.body.uuid + '/' + Math.floor(new Date().getTime() / 1000) + '.png';

                    skin.mv(file);

                    // Return a success response with information about the uploaded file
                    res.send({
                        status: true,
                        message: 'File is uploaded',
                        location: file,
                        data: {
                            name: skin.name,
                            mimetype: skin.mimetype,
                            size: skin.size
                        }
                    });
                } else {
                    // If the uploaded file has an unsupported mimetype, return an error response
                    res.status(500).send({
                        error: 'UnsupportedMimetypeException',
                        errorMessage: 'A file with an unsupported mimetype was uploaded'
                    });
                }
            }
        }
    } catch (err) {
        // Handle any unexpected errors and send a 500 (Internal Server Error) response
        console.log(err);
        res.status(500).send(err);
    }
});

// Export the router for use in other parts of the application
module.exports = router;