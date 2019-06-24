module.exports = async function listKeyRings(projectId) {
    // The location from which to list key rings, e.g. "global"
    const locationId = 'global';

    // Import the library and create a client
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();

    // Lists key rings
    const parent = client.locationPath(projectId, locationId);
    const [keyRings] = await client.listKeyRings({ parent });

    if (keyRings.length) {
        keyRings.forEach(keyRing => {
            // console.log(`${keyRing.name}:`);
            // console.log(`  Created: ${new Date(keyRing.createTime.seconds * 1000)}`);
        });
    } else {
        console.log('No key rings found.');
    }

    return keyRings;
};