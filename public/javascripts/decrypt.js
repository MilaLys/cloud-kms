module.exports.decrypt = async function () {
    require('dotenv').config();

    const fs = require('fs');
    const encFilesDir = './credentials-enc/';
    fs.readdir(encFilesDir, (error, files) => {
        if (error) throw error;
        files.forEach(async (ciphertextFileName) => {
            const { promisify } = require('util');
            const readFile = promisify(fs.readFile);
            const contentsBuffer = await readFile(`credentials-enc/${ciphertextFileName}`);
            const kms = require('@google-cloud/kms');
            const client = new kms.KeyManagementServiceClient();
            const name = client.cryptoKeyPath(
                process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID,
                process.env.CRYPTO_KEY_LOCATION,
                process.env.CRYPTO_KEY_RING_ID,
                process.env.CRYPTO_KEY_ID
            );
            const ciphertext = contentsBuffer.toString('base64');
            const [result] = await client.decrypt({ name, ciphertext });

            // Writes the decrypted file to disk
            const decrFilesDir = 'credentials';

            if (!fs.existsSync(decrFilesDir)) {
                fs.mkdirSync(decrFilesDir);
            }

            const writeFile = promisify(fs.writeFile);
            const plaintextFileName = ciphertextFileName.split('.').splice(0, 2).join('.');
            await writeFile(`${decrFilesDir}/${plaintextFileName}`, Buffer.from(result.plaintext, 'base64'))
                .catch(error => console.error(error));

            console.info(`Decrypted ${ciphertextFileName}, result saved to ${plaintextFileName}.`);
        })
    });
};