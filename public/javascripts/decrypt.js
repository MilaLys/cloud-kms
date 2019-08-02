const fs = require('fs');
const path = require('path');
const kms = require('@google-cloud/kms');

require('dotenv').config();

async function decrypt() {
    const client = new kms.KeyManagementServiceClient();
    const NODE_ENV = process.env.NODE_ENV;
    const MODE_ENV = process.env.MODE_ENV;
    const DECRYPTED_FILES_DIR = 'credentials';
    const ENCRYPTED_FILES_DIR = 'credentials-enc';
    const CRYPTO_KEY_RING_ID = `${MODE_ENV}-key-ring`;
    const GOOGLE_CLOUD_OAUTH_PROJECT_ID = process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID;
    const CRYPTO_KEY_LOCATION = process.env.CRYPTO_KEY_LOCATION;
    const ORIGINAL_FILE_PATH = path.resolve(DECRYPTED_FILES_DIR, `${MODE_ENV}.${NODE_ENV}.json`);
    const ENCRYPTED_FILE_PATH = path.resolve(ENCRYPTED_FILES_DIR, `${MODE_ENV}.${NODE_ENV}.encrypted.json`);

    if (!fs.existsSync(DECRYPTED_FILES_DIR)) {
        fs.mkdirSync(DECRYPTED_FILES_DIR);
    }

    const encCredentials = require(ENCRYPTED_FILE_PATH);
    const decrCredentials = {};

    for (const KEY in encCredentials) {
        const VALUE = encCredentials[KEY];
        decrCredentials[KEY] = VALUE;

        try {
            const GCP_DECRYPT_KEY = client.cryptoKeyPath(
                GOOGLE_CLOUD_OAUTH_PROJECT_ID,
                CRYPTO_KEY_LOCATION,
                CRYPTO_KEY_RING_ID,
                KEY
            );
            const ciphertext = Buffer.from(decrCredentials[KEY], 'base64');
            const [result] = await client.decrypt({ name: GCP_DECRYPT_KEY, ciphertext });
            const DEC_VALUE = result.plaintext.toString('utf8');

            decrCredentials[KEY] = DEC_VALUE;

            console.info(`${KEY} decrypted, result saved to ${ORIGINAL_FILE_PATH}.`);

        } catch (error) {
            console.error(error);
            throw error;
        }
        fs.writeFileSync(ORIGINAL_FILE_PATH, JSON.stringify(decrCredentials));
    }
}

decrypt();