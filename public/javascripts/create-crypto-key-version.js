module.exports = async function createCryptoKeyVersion(
    projectId,
    keyRingId,
    cryptoKeyId
) {
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();
    const locationId = 'global';

    // Get the full path to the crypto key
    const parent = client.cryptoKeyPath(
        projectId,
        locationId,
        keyRingId,
        cryptoKeyId
    );

    const [result] = await client.createCryptoKeyVersion({ parent });
    console.log(`Crypto key version ${result.name} created.`);
};