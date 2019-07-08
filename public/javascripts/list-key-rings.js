module.exports.listKeyRings = async function (projectId) {
    const locationId = 'global';
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();
    const parent = client.locationPath(projectId, locationId);
    const [keyRings] = await client.listKeyRings({ parent }).catch(error => console.error(error));

    if (keyRings.length) {
        keyRings.forEach(keyRing => {
            console.log(`${keyRing.name}:`);
            console.log(`  Created: ${new Date(keyRing.createTime.seconds * 1000)}`);
        });
    } else {
        console.log('No key rings found.');
    }

    return keyRings;
};