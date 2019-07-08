module.exports.listCryptoKeys = async function (keyRingId) {
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();
    let parent = `${keyRingId}`;
    const [cryptoKeys] = await client.listCryptoKeys({ parent }).catch(error => console.error(error));

    if (cryptoKeys.length) {
        cryptoKeys.forEach(cryptoKey => {
            console.log(`${cryptoKey.name}`);
            console.log(`Created: ${new Date(cryptoKey.createTime)}`);
            console.log(`Purpose: ${cryptoKey.purpose}`);
            console.log(`Primary: ${cryptoKey.primary.name}`);
            console.log(`State: ${cryptoKey.primary.state}`);
            console.log(`Created: ${new Date(cryptoKey.primary.createTime)}`);
        });
    } else {
        console.log('No crypto keys found.');
    }

    return cryptoKeys;
};