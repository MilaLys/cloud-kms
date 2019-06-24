const express = require('express');
const app = express();

const createKeyRing = require('./public/javascripts/create-key-ring');
const createCryptoKey = require('./public/javascripts/create-crypto-key');
const createCryptoKeyVersion = require('./public/javascripts/create-crypto-key-version');
const decrypt = require('./public/javascripts/decrypt');
const deleteFile = require('./public/javascripts/delete-file');
const downloadFile = require('./public/javascripts/download-file');
const encrypt = require('./public/javascripts/encrypt');
const listCryptoKeys = require('./public/javascripts/list-crypto-keys');
const listKeyRings = require('./public/javascripts/list-key-rings');
const uploadFile = require('./public/javascripts/upload-file');

const GCP_KEY_RING_ID = 'storage'; // `${MODE_ENV}-ring`
const GCP_CRYPTO_KEY_ID = 'mykey'; // `${MODE_ENV}-${NODE_ENV}-key`
const GCP_BUCKET_NAME = 'secrets_bucket-1';

const MODE_ENV = process.env.MODE_ENV || 'local';
const NODE_ENV = process.env.NODE_ENV || 'ds';

// createKeyRing(
//         process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID,
//         GCP_KEY_RING_ID)
//     .then(() => console.info('Key ring created successfully!'))
//     .catch(error => console.error(error));
//
// createCryptoKey(
//         process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID,
//         GCP_KEY_RING_ID,
//         GCP_CRYPTO_KEY_ID)
//     .then(() => console.info('Key ring created successfully!'))
//     .catch(error => console.error(error));
//

// downloadFile(
//     GCP_BUCKET_NAME,
//     `${MODE_ENV}-${NODE_ENV}.txt.encrypted`,
//     `credentials-enc/${MODE_ENV}-${NODE_ENV}.txt.encrypted`)
//     .then(() => {
//         decrypt(
//             process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID,
//             GCP_KEY_RING_ID,
//             GCP_CRYPTO_KEY_ID,
//             `credentials-enc/${MODE_ENV}-${NODE_ENV}.txt.encrypted`,
//             `credentials/${MODE_ENV}-${NODE_ENV}.txt`)
//             .then(() => console.log('Decrypted successfully!'))
//             .catch(error => console.error(error));
//     })
//     .catch(error => console.error(error));

// createCryptoKeyVersion(
//         process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID,
//         GCP_KEY_RING_ID,
//         GCP_CRYPTO_KEY_ID);


// encrypt(
//     process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID,
//     GCP_KEY_RING_ID,
//     GCP_CRYPTO_KEY_ID,
//     `credentials/${MODE_ENV}-${NODE_ENV}.txt`,
//     `credentials-enc/${MODE_ENV}-${NODE_ENV}.txt.encrypted`)
//     .then(() => {
//         console.log('Encrypted successfully!');
//         uploadFile(
//             GCP_BUCKET_NAME,
//             `${MODE_ENV}-${NODE_ENV}.txt.encrypted`)
//             .then(async () => {
//                 await deleteFile(`${MODE_ENV}-${NODE_ENV}.txt`)
//                     .catch((error) => {
//                         console.error(error);
//                     });
//             })
//             .catch(error => console.error(error));
//     })
//     .catch(error => console.error(error));

listKeyRings(process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID)
    .then((keyRings) => {
        if (keyRings) {
            keyRings.forEach(async (keyRing) => {
                try {
                    const cryptoKeys = await listCryptoKeys(keyRing.name);
                    cryptoKeys.forEach(async () => await downloadFile(GCP_BUCKET_NAME)
                        .then(async () => {
                            // decrypt(
                            //     process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID,
                            //     GCP_KEY_RING_ID,
                            //     GCP_CRYPTO_KEY_ID,
                            //     `credentials-enc/${MODE_ENV}-${NODE_ENV}.txt.encrypted`,
                            //     `credentials/${MODE_ENV}-${NODE_ENV}.txt`)
                            //     .catch((error) => console.error('Decrypt failed', error))
                        })
                        .catch(error => console.error('Download failed', error)))
                } catch (error) {
                    console.log(error);
                }
            });
        }
    })
    .catch(error => console.error(error));
