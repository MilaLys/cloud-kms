const fs = require('fs');
const util = require('util');
const path = require('path');
const _ = require('lodash');
const kms = require('@google-cloud/kms');
const nconf = require('nconf');

nconf.argv().env();

const FILES_DIR = 'credentials';

if (!fs.existsSync(FILES_DIR)) {
    fs.mkdirSync(FILES_DIR);
}

class KMSService {

    constructor(nconf, FILES_DIR) {
        this.CRYPTO_KEY_LOCATION = 'global';
        const NODE_ENV =  nconf.get('NODE_ENV');
        const MODE_ENV =  nconf.get('MODE_ENV');
        this.CRYPTO_ACTION = nconf.get('CRYPTO_ACTION');
        this.GOOGLE_CLOUD_OAUTH_PROJECT_ID = nconf.get('GOOGLE_CLOUD_OAUTH_PROJECT_ID');
        this.CRYPTO_KEY_RING_ID = `${MODE_ENV}-key-ring`;
        const SUFFIX_SOURCE = this.CRYPTO_ACTION === 'encrypt' ? '' : '.encrypted';
        const SUFFIX_TARGET = this.CRYPTO_ACTION === 'encrypt' ? '.encrypted' : '';
        this.pathToSource =  path.resolve(FILES_DIR, `${MODE_ENV}.${NODE_ENV}${SUFFIX_SOURCE}.json`);
        this.pathToTarget = path.resolve(FILES_DIR, `${MODE_ENV}.${NODE_ENV}${SUFFIX_TARGET}.json`);
        this.client = new kms.KeyManagementServiceClient();
    }

    async doCryptoAction() {
        const source = require(this.pathToSource);
        const parent = this.client.keyRingPath(this.GOOGLE_CLOUD_OAUTH_PROJECT_ID, this.CRYPTO_KEY_LOCATION, this.CRYPTO_KEY_RING_ID);
        const [CRYPTO_KEYS_FROM_GCP] = await this.client.listCryptoKeys({ parent });
        const ONLY_ACTUAL_CRYPTO_KEYS = CRYPTO_KEYS_FROM_GCP.reduce((result, cryptoKey) => {
            if (cryptoKey.primary.state === 'ENABLED') {
                result.push(cryptoKey.name.split('/').pop());
            }

            return result;
        }, []);

        const hasCredentialFileAllRequiredFields = ONLY_ACTUAL_CRYPTO_KEYS.every((KEY) => KEY in source);
        
        if (!hasCredentialFileAllRequiredFields) {
            throw new Error('ALARM');
        }

        const target = {};

        for (const KEY in source) {
            if (!ONLY_ACTUAL_CRYPTO_KEYS.includes(KEY)) {
                target[KEY] = source[KEY];
                continue;
            }

            const GCP_ENCRYPT_DECRYPT_KEY = this.client.cryptoKeyPath(
                this.GOOGLE_CLOUD_OAUTH_PROJECT_ID,
                this.CRYPTO_KEY_LOCATION,
                this.CRYPTO_KEY_RING_ID,
                KEY
            );

            target[KEY] = await this[this.CRYPTO_ACTION](source[KEY], GCP_ENCRYPT_DECRYPT_KEY);

            console.info(`[action=${this.CRYPTO_ACTION}]: key=${KEY}`);
        }

        const writeFilePromise = util.promisify(fs.writeFile);
        await writeFilePromise(this.pathToTarget, JSON.stringify(target));
    }

    async encrypt(VALUE, GCP_ENCRYPT_DECRYPT_KEY) {
        const plaintext = Buffer.from(VALUE);
        const [result] = await this.client.encrypt({ name: GCP_ENCRYPT_DECRYPT_KEY, plaintext });

        return result.ciphertext.toString('base64');
    }

    async decrypt(VALUE, GCP_ENCRYPT_DECRYPT_KEY) {
        const ciphertext = Buffer.from(VALUE, 'base64');
        const [result] = await this.client.decrypt({ name: GCP_ENCRYPT_DECRYPT_KEY, ciphertext });

        return result.plaintext.toString('utf8');
    }
}

const kmsService = new KMSService(nconf, FILES_DIR);
new Promise (() => kmsService.doCryptoAction());