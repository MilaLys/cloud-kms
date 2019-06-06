async function decrypt(
    projectId = 'your-project-id', // Your GCP projectId
    keyRingId = 'my-key-ring', // Name of the crypto key's key ring
    cryptoKeyId = 'my-key', // Name of the crypto key, e.g. "my-key"
    ciphertextFileName = './credentials-enc',
    plaintextFileName = './credentials'
) {
    const fs = require('fs');
    const {promisify} = require('util');

    // Import the library and create a client
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();

    // The location of the crypto key's key ring, e.g. "global"
    const locationId = 'global';

    // Reads the file to be decrypted
    const readFile = promisify(fs.readFile);
    const contentsBuffer = await readFile(ciphertextFileName);
    const name = client.cryptoKeyPath(
        projectId,
        locationId,
        keyRingId,
        cryptoKeyId
    );
    const ciphertext = contentsBuffer.toString('base64');

    // Decrypts the file using the specified crypto key
    const [result] = await client.decrypt({name, ciphertext});

    // Writes the decrypted file to disk
    const writeFile = promisify(fs.writeFile);
    await writeFile(plaintextFileName, Buffer.from(result.plaintext, 'base64'));
    console.log(
        `Decrypted ${ciphertextFileName}, result saved to ${plaintextFileName}.`
    );
}