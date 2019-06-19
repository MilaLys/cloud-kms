module.exports = async function createCryptoKeyVersion(
    projectId, // Your Google Cloud Platform project ID
    keyRingId, // Name of the crypto key version's key ring, e.g. "my-key-ring"
    cryptoKeyId // Name of the version's crypto key
) {
    // Import the library and create a client
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();

    // The location of the crypto key versions's key ring, e.g. "global"
    const locationId = 'global';

    // Get the full path to the crypto key
    const parent = client.cryptoKeyPath(
        projectId,
        locationId,
        keyRingId,
        cryptoKeyId
    );

    // Creates a new crypto key version
    const [result] = await client.createCryptoKeyVersion({ parent });
    console.log(`Crypto key version ${result.name} created.`);
};