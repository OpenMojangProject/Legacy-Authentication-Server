// Import the 'uuid' library to generate UUIDs
const { v4: uuidv4 } = require('uuid');

// Function to generate a UUID without hyphens
function generateUUIDWithoutHyphens() {
  // Generate a UUID using the 'uuidv4' function and remove hyphens
  const uuid = uuidv4().replace(/-/g, '');
  return uuid;
}

// Export the function for use in other parts of the application
module.exports = {
  generateUUIDWithoutHyphens
};
