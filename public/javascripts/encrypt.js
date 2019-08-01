const getKeys = require('./list-crypto-keys');
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

async function encrypt() {
    require('dotenv').config();

    const NODE_ENV = process.env.NODE_ENV;
    const MODE_ENV = process.env.MODE_ENV;
    const DECRYPTED_FILES_DIR = 'credentials';
    const ENCRYPTED_FILES_DIR = 'credentials-enc';
    const CRYPTO_KEY_RING_ID = `${MODE_ENV}-key-ring`;
    const GOOGLE_CLOUD_OAUTH_PROJECT_ID = process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID;
    const CRYPTO_KEY_LOCATION = process.env.CRYPTO_KEY_LOCATION;
    // const REQUIRED_KEYS_TO_ENCRYPT_IN_CREDENTIALS_FILE = ['GCP_ID_FOLDER', 'GCP_OWNER_ACCOUNT', 'GCP_BILLING_ACCOUNT', 'MONGODB_URL'];
    const ORIGINAL_FILE_PATH = path.resolve(DECRYPTED_FILES_DIR, `${MODE_ENV}.${NODE_ENV}.json`);
    const ENCRYPTED_FILE_PATH = path.resolve(ENCRYPTED_FILES_DIR, `${MODE_ENV}.${NODE_ENV}.json.encrypted`);

    const cryptoKeys = await getKeys.listCryptoKeys(CRYPTO_KEY_RING_ID);
    const CRYPTO_KEYS_FROM_GCP = cryptoKeys.map(key => {
        const GCP_FULL_KEY_PATH = key.primary.name.split('/');

        return GCP_FULL_KEY_PATH[GCP_FULL_KEY_PATH.length - 3];
    });

    if (!fs.existsSync(ENCRYPTED_FILES_DIR)) {
        fs.mkdirSync(ENCRYPTED_FILES_DIR);
    }

    const credentials = require(ORIGINAL_FILE_PATH);
    const encCredentials = {};

    for (const KEY in credentials) {
        const VALUE = credentials[KEY];
        const plaintext = Buffer.from(VALUE, 'base64');
        const kms = require('@google-cloud/kms');
        const client = new kms.KeyManagementServiceClient();

        if (!CRYPTO_KEYS_FROM_GCP.includes(KEY)) {
            encCredentials[KEY] = VALUE;

            continue;
        }

        try {
            const GCP_ENCRYPT_KEY = client.cryptoKeyPath(
                GOOGLE_CLOUD_OAUTH_PROJECT_ID,
                CRYPTO_KEY_LOCATION,
                CRYPTO_KEY_RING_ID,
                KEY
            );

            const [{ ciphertext }] = await client.encrypt({ name: GCP_ENCRYPT_KEY, plaintext });
            const ENC_VALUE = ciphertext.toString('base64');
            encCredentials[KEY] = ENC_VALUE;
            console.info(`${KEY} is successfully encrypted and save to ${ENCRYPTED_FILE_PATH}.`)
        } catch (error) {
            console.error(error);
        }
    }
    fs.writeFileSync(ENCRYPTED_FILE_PATH, JSON.stringify(encCredentials));
}

encrypt();