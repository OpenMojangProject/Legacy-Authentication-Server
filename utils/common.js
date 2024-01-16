const { v4: uuidv4 } = require('uuid');

function generateUUIDWithoutHyphens() {
  return uuidv4().replace(/-/g, '');
}

function getUUIDWithoutHyphens(uuid) {
  return uuid.replace(/-/g, '');
}

// Export the function for use in other parts of the application
module.exports = {
  generateUUIDWithoutHyphens,
  getUUIDWithoutHyphens
};
