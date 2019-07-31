module.exports.decrypt = async function () {
    require('dotenv').config();

    const NODE_ENV = process.argv[1].split('=').splice(1, 2)[0];
    const MODE_ENV = process.argv[2].split('=').splice(1, 2)[0];
    const fs = require('fs');
    const encFilesDir = './credentials-enc/';
    let CRYPTO_KEY_ID;
    let keys;
    let obj;

    fs.readFile(`./credentials/${MODE_ENV}.${NODE_ENV}.txt`, 'utf8', (err, data) => {
        if (err) throw err;
        obj = JSON.parse(data);
        keys = Object.keys(obj);
        keys.forEach((key) => {
            CRYPTO_KEY_ID = `${key}-key`;
        });

        try {
            const lineReader = require('readline').createInterface({
                input: require('fs').createReadStream(`${encFilesDir}/${MODE_ENV}.${NODE_ENV}.txt.encrypted`)
            });

            lineReader.on('line', async (line) => {
                const CRYPTO_KEY_RING_ID = `${MODE_ENV}-key-ring`;
                const kms = require('@google-cloud/kms');
                const client = new kms.KeyManagementServiceClient();
                const name = client.cryptoKeyPath(
                    process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID,
                    process.env.CRYPTO_KEY_LOCATION,
                    CRYPTO_KEY_RING_ID,
                    CRYPTO_KEY_ID
                );

                const [result] = await client.decrypt({ name, line });
                // Writes the decrypted file to disk
                const decrFilesDir = 'credentials';

                if (!fs.existsSync(decrFilesDir)) {
                    fs.mkdirSync(decrFilesDir);
                }

                const { promisify } = require('util');
                const writeFile = promisify(fs.writeFile);
                const plaintextFileName = `${MODE_ENV}.${NODE_ENV}.txt`;
                await writeFile(`${decrFilesDir}/${plaintextFileName}`, Buffer.from(result.plaintext, 'base64'))
                    .catch(error => console.error(error));

                console.info(`Decrypted ${MODE_ENV}.${NODE_ENV}.txt.encrypted, result saved to ${plaintextFileName}.`);
            });

        } catch (error) {
            console.error(error);
        }
    });

    fs.readFile(`${encFilesDir}/${MODE_ENV}.${NODE_ENV}.txt.encrypted`, 'utf8', (err, data) => {
        const arr = data.split(',');
        console.log(arr)
    })
};