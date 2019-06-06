async function encrypt(
    projectId = 'your-project-id', // Your GCP projectId
    keyRingId = 'my-key-ring', // Name of the crypto key's key ring
    cryptoKeyId = 'my-key', // Name of the crypto key, e.g. "my-key"
    plaintextFileName = './credentials',
    ciphertextFileName = './credentials-enc'
) {
    const fs = require('fs');
    const { promisify } = require('util');

    // Import the library and create a client
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();

    // The location of the crypto key's key ring, e.g. "global"
    const locationId = 'global';

    // Reads the file to be encrypted
    const readFile = promisify(fs.readFile);
    const contentsBuffer = await readFile(plaintextFileName);
    const plaintext = contentsBuffer.toString('base64');
    const name = client.cryptoKeyPath(
        projectId,
        locationId,
        keyRingId,
        cryptoKeyId
    );

    // Encrypts the file using the specified crypto key
    const [result] = await client.encrypt({ name, plaintext });
    const writeFile = promisify(fs.writeFile);
    await writeFile(ciphertextFileName, Buffer.from(result.ciphertext, 'base64'));
    console.log(`Encrypted ${plaintextFileName} using ${result.name}.`);
    console.log(`Result saved to ${ciphertextFileName}.`);
}