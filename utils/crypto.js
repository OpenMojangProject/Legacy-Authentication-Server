// Import required libraries
const crypto = require('crypto'); // Node.js crypto module for cryptographic operations
const fs = require('fs'); // Node.js file system module for file operations
const base64js = require('base64-js'); // Library for base64 encoding/decoding

// Function to generate RSA key pair and save it to files
function generateKeys() {
  // Check if the 'keys' directory does not exist
  if (!fs.existsSync('keys')) {
    // Generate an RSA key pair with specified options
    const keyPair = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096, // Adjust the modulus length as needed (e.g., 2048, 3072, 4096)
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs1',
        format: 'pem'
      }
    });

    // Create the 'keys' directory
    fs.mkdirSync('keys');

    // Save the generated private and public keys to files
    fs.writeFileSync('keys/private.pem', keyPair.privateKey);
    fs.writeFileSync('keys/public.pem', keyPair.publicKey);
  }

  // Return the contents of the public key file
  return fs.readFileSync('keys/public.pem', 'utf8');
}

// Function to convert a public key to PEM format
function toPEMPublicKey() {
  // Generate the RSA public key and retrieve it in PEM format
  const publicKey = generateKeys();
  const encoded = base64js.fromByteArray(crypto.createPublicKey({
    key: publicKey,
    format: 'pem',
  }).export({ type: 'spki', format: 'der' }));
  
  // Format the PEM public key for readability
  return `-----BEGIN PUBLIC KEY-----\n${formatPEM(encoded)}\n-----END PUBLIC KEY-----\n`;
}

// Function to format a long string into multiple lines of a specified maximum length
function formatPEM(input) {
  const maxLength = 64; // Maximum line length
  const parts = [];
  
  // Split the input string into parts of maximum length
  for (let i = 0; i < input.length; i += maxLength) {
    parts.push(input.slice(i, i + maxLength));
  }
  
  // Join the parts with newline characters to format the PEM key
  return parts.join('\n');
}

// Export the functions for use in other parts of the application
module.exports = {
  generateKeys, // Function to generate RSA key pair
  toPEMPublicKey // Function to convert public key to PEM format
};
