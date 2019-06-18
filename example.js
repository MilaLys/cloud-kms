const KMSClient = require('./public/helpers/google-cloud-kms');
const client = new KMSClient();
const moment = require('moment');

// client
//     .createKeyRing({ keyRingId: 'key-ring-test-1' })
//     .then(() => console.log('Key ring created successfully!'))
//     .catch(error => console.error('ERROR', error));
// const params = {
//     pageSize: 10
// };
// client
//     .listKeyRing(params)
//     .then(res => console.log('List of key rings', res))
//     .catch(error => console.error('ERROR', error));
//
// client
//     .getKeyRing({ keyRingName: 'storage' })
//     .then(res => console.log('Metadata of key ring', res.name))
//     .catch(error => console.error('ERROR', error));

// Create Crypto Key
// const labelsMap = new Map();
// labelsMap.set('abc', 'def');
// labelsMap.set('ghi', 'jkl');

// client
//     .createCryptoKey({
//         keyRingName: 'key-ring-test-1',
//         cryptoKeyId: 'crypto-key-test-1',
//         resource: {
//             purpose: 'ENCRYPT_DECRYPT', // must be CRYPTO_KEY_PURPOSE_UNSPECIFIED or ENCRYPT_DECRYPT
//             nextRotationTime: moment(new Date()).add(3, 'months').toISOString(),
//             labels: labelsMap,
//             rotationPeriod: (30 * 86400) + 's',
//         }
//     })
//     .then(() => console.log('Key created successfully'))
//     .catch(error => console.log('ERROR', error));

// client
//     .listCryptoKey({
//         keyRingName: 'key-ring-test-1',
//     })
//     .then(result => result.data)
//     .catch(error => console.log('ERROR', error));

client
    .getCryptoKey({
        keyRingName: 'storage',
        cryptoKeyId: 'mykey',
    })
    .then(res => console.log('Crypto Key', res.data.name))
    .catch(error => console.log('Error happened', error));

// Encrypt data
// client
//     .encrypt({
//         keyRingName: 'key-ring-test-1',
//         cryptoKeyId: 'crypto-key-test-1',
//         cryptoKeyVersion: 1,
//         requestBody: {
//             plaintext: Buffer.from('Hello World').toString('base64'),
//         }
//     })
//     .then(result => console.log(result.data))
//     .catch(error => console.log('ERROR', error));

// Decrypt data
// client
//     .decrypt({
//         keyRingName: 'key-ring-test-1',
//         cryptoKeyId: 'crypto-key-test-1',
//         requestBody: {
//             ciphertext: 'CiQADHkK/ri2G7jMT4Aj7XhKGBzJ4qqGJOKDYWwQa/lRk5jlH4QSNACq6qsKcNrRBYZblAb3i1lzWcdI6g1y9T7cGj6KUaPCzLaAH1m8+hLhvavn/J3Ns5zKiS8='
//         }
//     })
//     .then(res => console.log('Data decrypted successfully!', res))
//     .catch(error => console.log('ERROR', error));