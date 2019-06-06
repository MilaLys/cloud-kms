async function createKeyRing(
    projectId = 'YOUR_PROJECT_ID', // Your GCP projectId
    keyRingId = 'my-new-key-ring' // Name of the new key ring
) {
    // The location of the new key ring, e.g. "global"
    const locationId = 'global';

    // Import the library and create a client
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();

    // Get the full path to the parent
    const parent = client.locationPath(projectId, locationId);

    // Creates a new key ring
    const [result] = await client.createKeyRing({parent, keyRingId});
    console.log(`Key ring ${result.name} created.`);
}