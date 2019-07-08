module.exports.decrypt = async function () {
    require('dotenv').config();

    const NODE_ENV = process.argv[1].split('=').splice(1, 2)[0];
    const MODE_ENV = process.argv[2].split('=').splice(1, 2)[0];
    const fs = require('fs');
    const encFilesDir = './credentials-enc/';

    fs.readdir(encFilesDir, (error, files) => {
        if (error) throw error;
        files.forEach(async (ciphertextFileName) => {
            const envsFromFile = ciphertextFileName.split('.');
            const modeFromFile = envsFromFile[0];
            const nodeFromFile = envsFromFile[1];

            if (nodeFromFile === NODE_ENV && modeFromFile === MODE_ENV) {
                const CRYPTO_KEY_RING_ID = `${MODE_ENV}-key-ring`;
                const CRYPTO_KEY_ID = `${MODE_ENV}-${NODE_ENV}-key`;
                const { promisify } = require('util');
                const readFile = promisify(fs.readFile);
                const contentsBuffer = await readFile(`credentials-enc/${ciphertextFileName}`);
                const kms = require('@google-cloud/kms');
                const client = new kms.KeyManagementServiceClient();
                const name = client.cryptoKeyPath(
                    process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID,
                    process.env.CRYPTO_KEY_LOCATION,
                    CRYPTO_KEY_RING_ID,
                    CRYPTO_KEY_ID
                );
                const ciphertext = contentsBuffer.toString('base64');
                const [result] = await client.decrypt({ name, ciphertext });

                // Writes the decrypted file to disk
                const decrFilesDir = 'credentials';

                if (!fs.existsSync(decrFilesDir)) {
                    fs.mkdirSync(decrFilesDir);
                }

                const writeFile = promisify(fs.writeFile);
                const plaintextFileName = `${MODE_ENV}.${NODE_ENV}.txt`;
                await writeFile(`${decrFilesDir}/${plaintextFileName}`, Buffer.from(result.plaintext, 'base64'))
                    .catch(error => console.error(error));

                console.info(`Decrypted ${ciphertextFileName}, result saved to ${plaintextFileName}.`);
            }
        })
    });
};