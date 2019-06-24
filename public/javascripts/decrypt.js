module.exports = async function decrypt(
    projectId,
    keyRingId,
    cryptoKeyId,
    ciphertextFileName,
    plaintextFileName
) {
    console.log(ciphertextFileName, plaintextFileName);
    const fs = require('fs');
    const { promisify } = require('util');

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
    const [result] = await client.decrypt({ name, ciphertext });

    // Writes the decrypted file to disk
    const dir = 'credentials';
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    const writeFile = promisify(fs.writeFile);
    await writeFile(plaintextFileName, Buffer.from(result.plaintext, 'base64'));
    console.log(
        `Decrypted ${ciphertextFileName}, result saved to ${plaintextFileName}.`
    );
};