module.exports.deleteFile = function () {
    require('dotenv').config();

    const fs = require('fs');
    const decrFilesDir = './credentials/';

    fs.readdir(decrFilesDir, (error, files) => {
        if (error) throw error;
        files.forEach(async (file) => {
            await fs.unlink(`${decrFilesDir}/${file}`, (error) => {
                if (error) throw error;
                console.info(`File ${file} deleted!`);
            });
        });
        fs.rmdir(decrFilesDir, (error) => {
            if (error) throw error;
            console.info(`Folder ${decrFilesDir} deleted!`);
        });
    })
};