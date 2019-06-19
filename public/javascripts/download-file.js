module.exports = async function downloadFile(bucketName, srcFilename, destFilename) {
    // Imports the Google Cloud client library
    const { Storage } = require('@google-cloud/storage');

    // Creates a client
    const storage = new Storage();
    const options = {
        destination: destFilename,
    };

    // Downloads the file
    await storage
        .bucket(bucketName)
        .file(srcFilename)
        .download(options);

    console.log(
        `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
    );
};