module.exports = async function createCryptoKey(
    projectId,
    keyRingId,
    cryptoKeyId
) {
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();
    const locationId = 'global';
    const parent = client.keyRingPath(projectId, locationId, keyRingId);

    const [cryptoKey] = await client.createCryptoKey({
        parent,
        cryptoKeyId,
        cryptoKey: {
            purpose: 'ENCRYPT_DECRYPT',
        },
    });
    console.log(`Key ${cryptoKey.name} created.`);
};