const getKeys = require('./list-crypto-keys');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const kms = require('@google-cloud/kms');

require('dotenv').config();

async function encrypt() {
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

    if (!fs.existsSync(ENCRYPTED_FILES_DIR)) {
        fs.mkdirSync(ENCRYPTED_FILES_DIR);
    }

    const credentials = require(ORIGINAL_FILE_PATH);
    const CRYPTO_KEYS_FROM_GCP = await getKeys.listCryptoKeys(CRYPTO_KEY_RING_ID);
    const hasCredentialFileAllRequiredFields = CRYPTO_KEYS_FROM_GCP.every((KEY) => {
        return !!credentials[KEY];
    });

    if (hasCredentialFileAllRequiredFields) {
        throw new Error('ALARM');
    }

    const encCredentials = {};

    for (const KEY in credentials) {
        try {
            const VALUE = credentials[KEY];
            const GCP_ENCRYPT_KEY = client.cryptoKeyPath(
                GOOGLE_CLOUD_OAUTH_PROJECT_ID,
                CRYPTO_KEY_LOCATION,
                CRYPTO_KEY_RING_ID,
                KEY
            );

            const plaintext = Buffer.from(VALUE);
            const [result] = await client.encrypt({ name: GCP_ENCRYPT_KEY, plaintext });
            encCredentials[KEY] = result.ciphertext.toString('base64');

            console.info(`${KEY} is successfully encrypted and save to ${ENCRYPTED_FILE_PATH}.`)
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    fs.writeFileSync(ENCRYPTED_FILE_PATH, JSON.stringify(encCredentials));
}

encrypt();