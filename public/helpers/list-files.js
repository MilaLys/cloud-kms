module.exports = async function listFiles(bucketName) {
    const { Storage } = require('@google-cloud/storage');
    const storage = new Storage();
    const [files] = await storage.bucket(bucketName).getFiles();
    if (files.length > 0) {
        return files;
    }
    console.info(`${bucketName} is empty`);
};