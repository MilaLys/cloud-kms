async function createCryptoKey(
    projectId = 'your-project-id', // Your GCP Project Id
    keyRingId = 'my-key-ring', // Name of the crypto key's key ring
    cryptoKeyId = 'my-key' // Name of the crypto key
) {
    // Import the library and create a client
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();

    // The location of the new crypto key's key ring, e.g. "global"
    const locationId = 'global';

    const parent = client.keyRingPath(projectId, locationId, keyRingId);

    // Creates a new key ring
    const [cryptoKey] = await client.createCryptoKey({
        parent,
        cryptoKeyId,
        cryptoKey: {
            // This will allow the API access to the key for encryption and decryption
            purpose: 'ENCRYPT_DECRYPT',
        },
    });
    console.log(`Key ${cryptoKey.name} created.`);
}