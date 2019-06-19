module.exports = async function deleteFile(file) {
    const fs = require('fs');

    fs.unlink(file, function (err) {
        if (err) throw err;
        console.log('File deleted!');
    });
};