import * as fs from "node:fs";
import * as crypto from "node:crypto";

export function generateKeys() {
  // Check if the 'keys' directory does not exist
  if (!fs.existsSync("keys")) {
    // Generate an RSA key pair with specified options
    const keyPair = crypto.generateKeyPairSync("rsa", {
      modulusLength: 4096, // Adjust the modulus length as needed (e.g., 2048, 3072, 4096)
      publicKeyEncoding: {
        type: "spki",
        format: "pem",
      },
      privateKeyEncoding: {
        type: "pkcs1",
        format: "pem",
      },
    });

    // Create the 'keys' directory
    fs.mkdirSync("keys");

    // Save the generated private and public keys to files
    fs.writeFileSync("keys/private.pem", keyPair.privateKey);
    fs.writeFileSync("keys/public.pem", keyPair.publicKey);
  }

  // Return the contents of the public key file
  return fs.readFileSync("keys/public.pem", "utf8");
}

export function getPublicKey() {
  const publicKey = fs.readFileSync("keys/public.pem", "utf8");
  return publicKey.replace(/\r?\n|\r/g, "\n");
}
