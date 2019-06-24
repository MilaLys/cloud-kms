module.exports = function deleteFile(file) {
    const fs = require('fs');

    fs.unlink(file, function (err) {
        if (err) throw err;
        console.info('File deleted!');
    });
};