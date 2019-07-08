module.exports.encrypt = async function () {
    require('dotenv').config();

    const NODE_ENV = process.argv[1].split('=').splice(1, 2)[0];
    const MODE_ENV = process.argv[2].split('=').splice(1, 2)[0];
    const decrFilesDir = './credentials/';
    const fs = require('fs');
    fs.readdir(decrFilesDir, (error, files) => {
        if (error) throw error;
        files.forEach(async (file) => {
            const envsFromFile = file.split('.');
            const modeFromFile = envsFromFile[0];
            const nodeFromFile = envsFromFile[1];

            if (nodeFromFile === NODE_ENV && modeFromFile === MODE_ENV) {
                const CRYPTO_KEY_RING_ID = `${MODE_ENV}-key-ring`;
                const CRYPTO_KEY_ID = `${MODE_ENV}-${NODE_ENV}-key`;
                const kms = require('@google-cloud/kms');
                const client = new kms.KeyManagementServiceClient();
                const name = client.cryptoKeyPath(
                    process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID,
                    process.env.CRYPTO_KEY_LOCATION,
                    CRYPTO_KEY_RING_ID,
                    CRYPTO_KEY_ID
                );

                try {
                    const { promisify } = require('util');
                    const readFile = promisify(fs.readFile);
                    const contentsBuffer = await readFile(`${decrFilesDir}/${file}`);
                    const plaintext = contentsBuffer.toString('base64');
                    const [result] = await client.encrypt({ name, plaintext });
                    const writeFile = promisify(fs.writeFile);
                    const encFilesDir = 'credentials-enc';

                    if (!fs.existsSync(encFilesDir)) {
                        fs.mkdirSync(encFilesDir);
                    }

                    const ciphertextFileName = `${file}.encrypted`;
                    await writeFile(`${encFilesDir}/${ciphertextFileName}`, Buffer.from(result.ciphertext, 'base64'))
                        .catch(error => console.error(error));
                    console.info(`File ${file} encrypted and saved to ${ciphertextFileName}.`);
                } catch (error) {
                    console.error(error);
                }
            }
        });
    });
};