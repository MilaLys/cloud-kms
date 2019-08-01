module.exports.listCryptoKeys = async function (keyRingId) {
    const GOOGLE_CLOUD_OAUTH_PROJECT_ID = process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID;
    const CRYPTO_KEY_LOCATION = process.env.CRYPTO_KEY_LOCATION;
    const kms = require('@google-cloud/kms');
    const client = new kms.KeyManagementServiceClient();
    let parent = client.keyRingPath(GOOGLE_CLOUD_OAUTH_PROJECT_ID, CRYPTO_KEY_LOCATION, keyRingId);
    const [cryptoKeys] = await client.listCryptoKeys({ parent }).catch(error => console.error(error));

    if (cryptoKeys.length) {
        cryptoKeys.forEach(cryptoKey => {
            // console.log(`${cryptoKey.name}`);
            // console.log(`Created: ${new Date(cryptoKey.createTime)}`);
            // console.log(`Purpose: ${cryptoKey.purpose}`);
            // console.log(`Primary: ${cryptoKey.primary.name}`);
            // console.log(`State: ${cryptoKey.primary.state}`);
            // console.log(`Created: ${new Date(cryptoKey.primary.createTime)}`);
        });
    } else {
        console.log('No crypto keys found.');
    }

    return cryptoKeys;
};