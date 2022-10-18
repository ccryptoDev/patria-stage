"use strict";
const SftpClient = require('ssh2-sftp-client');
const fs = require('fs');
var stream = require('stream');
module.exports = {
    uploadFile,
    downloadFile,
    listDir
};

function listDir(dirPath, sftpConfig) {
    return new Promise((resolve, reject) => {
        if (!!dirPath && !!sftpConfig) {
            const client = new SftpClient();
            client.connect(sftpConfig).then(() => {
                return client.list(dirPath);
            }).then(data => {
                client.end();
                resolve(data);
            }).catch((errorObj) => {
                sails.log.error("SftpService.listDir; catch: ", errorObj);
                reject(errorObj);
            });
        }
    });
}

function downloadFile(remoteFilePath, localFilePath, sftpConfig) {
    return new Promise((resolve, reject) => {
        if (!!remoteFilePath && !!localFilePath && sftpConfig) {
            const client = new SftpClient();
            client.connect(sftpConfig).then(() => {
                return client.fastGet(remoteFilePath, localFilePath, {
                    concurrency: 16
                });
            }).then(() => {
                client.end();
                resolve(true);
            }).catch((errorObj) => {
                sails.log.error("SftpService.downloadFile; catch: ", errorObj);
                reject(errorObj);
            });
        }
    });
}

function uploadFile(uploadFile,remoteFilePath, sftpConfig) {
    return new Promise((resolve,reject) => {
        if(uploadFile && sftpConfig && !!remoteFilePath) {
            let fileStream = null;
            if(typeof uploadFile === "string" ) {
                fileStream = fs.createReadStream(uploadFile);
            }else if(Buffer.isBuffer(uploadFile)) {
                fileStream = bufferToStream(uploadFile);
            }else if(isReadableStream(uploadFile)){
                fileStream = uploadFile;
            }
            if(fileStream) {
                let client = new SftpClient();
                client.connect(sftpConfig).then(() => {
                    return client.put(fileStream, remoteFilePath, {
                        flags: 'w',  // w - write and a - append
                        encoding: null, // use null for binary files
                        mode: 0o666, // mode to use for created file
                        autoClose: true // automatically close the write stream when finished
                    })
                }).then(() => {
                    resolve(true);
                }).catch((errorObj) => {
                    sails.log.error( "SftpService.uploadFile; catch: ",errorObj );
                    reject(errorObj);
                });
            }else {
                reject({message: "Upload file passed in is not in the right format."})
            }
        }else {
            reject({message: "Unable to upload file. Missing required data"})
        }
    });
}
function isReadableStream(obj) {
    return (obj instanceof stream.Stream || obj instanceof stream.Readable) &&
        typeof (obj._read === 'function') &&
        typeof (obj._readableState === 'object');
}
function bufferToStream(buffer) {
    const stream = new stream.Readable();
    stream.push(buffer);
    stream.push(null);

    return stream;
}
