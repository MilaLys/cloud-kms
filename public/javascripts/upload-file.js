module.exports.uploadFile = async function () {
    require('dotenv').config();

    const encFilesDir = './credentials-enc/';

    fs.readdir(encFilesDir, (error, files) => {
        if (error) throw error;

        files.forEach(async (file) => {
            try {
                const { Storage } = require('@google-cloud/storage');
                const storage = new Storage();
                const bucketName = process.env.GCP_BUCKET_NAME;

                await storage
                    .bucket(bucketName)
                    .upload(`credentials-enc/${file}`, {
                        gzip: true,
                        metadata: {
                            cacheControl: 'public, max-age=31536000'
                        },
                    });
                console.info(`File ${file} uploaded to ${bucketName}.`);
            } catch (error) {
                console.error(error);
            }
        })
    });
};