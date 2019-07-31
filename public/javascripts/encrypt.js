module.exports.encrypt = async function () {
    require('dotenv').config();

    const NODE_ENV = process.argv[1].split('=').splice(1, 2)[0];
    const MODE_ENV = process.argv[2].split('=').splice(1, 2)[0];
    const decrFilesDir = './credentials/';
    const fs = require('fs');
    let CRYPTO_KEY_ID;
    let keys;
    let name;
    let obj;

    fs.readFile(`${decrFilesDir}/${MODE_ENV}.${NODE_ENV}.txt`, 'utf8', (err, data) => {
        const kms = require('@google-cloud/kms');
        const client = new kms.KeyManagementServiceClient();
        if (err) throw err;
        obj = JSON.parse(data);
        keys = Object.keys(obj);
        keys.forEach((key) => {
            CRYPTO_KEY_ID = `${key}-key`;
            const CRYPTO_KEY_RING_ID = `${MODE_ENV}-key-ring`;
            name = client.cryptoKeyPath(
                process.env.GOOGLE_CLOUD_OAUTH_PROJECT_ID,
                process.env.CRYPTO_KEY_LOCATION,
                CRYPTO_KEY_RING_ID,
                CRYPTO_KEY_ID
            );
            try {
                const lineReader = require('readline').createInterface({
                    input: require('fs').createReadStream(`${decrFilesDir}/${MODE_ENV}.${NODE_ENV}.txt`)
                });

                lineReader.on('line', async (line) => {
                    if (line.includes('}') || line.includes('{')) {
                        return;
                    }

                    const [result] = await client.encrypt({ name, line });
                    const encFilesDir = 'credentials-enc';

                    if (!fs.existsSync(encFilesDir)) {
                        fs.mkdirSync(encFilesDir);
                    }

                    const ciphertextFileName = `${MODE_ENV}.${NODE_ENV}.txt.encrypted`;
                    const { promisify } = require('util');
                    const appendFile = promisify(fs.appendFile);
                    const data = Buffer.from(result.ciphertext, 'base64');

                    await appendFile(`${encFilesDir}/${ciphertextFileName}`, `${CRYPTO_KEY_ID}: ${data},`);
                    console.info(`Line ${line} encrypted and saved to ${ciphertextFileName}.`);
                });

            } catch (error) {
                console.error(error);
            }
        });


    });
};