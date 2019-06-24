const listFiles = require('../helpers/list-files');
module.exports = async function downloadFile(bucketName) {
    const fs = require('fs');
    const { Storage } = require('@google-cloud/storage');
    const storage = new Storage();
    const files = await listFiles(bucketName);
    const dir = 'credentials-enc';

    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }

    let options = {};
    files.forEach(async (file) => {
        options = {
            destination: `${dir}/${file.name}`
        };
        // Downloads the file
        await storage
            .bucket(bucketName)
            .file(file.name)
            .download(options);
    });

    console.log(
        `gs:// Files from ${bucketName} downloaded.`
    );
};