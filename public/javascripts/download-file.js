module.exports.downloadFile = async function () {
    require('dotenv').config();

    const encFilesDir = 'credentials-enc';
    const fs = require('fs');
    if (!fs.existsSync(encFilesDir)) {
        fs.mkdirSync(encFilesDir);
    }

    const bucketName = process.env.GCP_BUCKET_NAME;
    const listFiles = require('../helpers/list-files');
    const files = await listFiles(bucketName);
    files.forEach(async (file) => {
        const { Storage } = require('@google-cloud/storage');
        const storage = new Storage();
        try {
            await storage
                .bucket(bucketName)
                .file(file.name)
                .download({ destination: `${encFilesDir}/${file.name}` });

            console.info(`File ${file.name} from ${bucketName} downloaded to ${encFilesDir}/${file.name}.`);

        } catch (error) {
            console.error(error);
        }
    });

    return files;
};