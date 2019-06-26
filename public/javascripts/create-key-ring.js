module.exports = async function createKeyRing(
    projectId,
    keyRingId
) {
    const locationId = 'global';
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();

    // Get the full path to the parent
    const parent = client.locationPath(projectId, locationId);

    // Creates a new key ring
    const [result] = await client.createKeyRing({ parent, keyRingId });
    console.log(`Key ring ${result.name} created.`);
};