var path = require('path');
module.exports.firstAssociatesConfig = {
    getFirstAssociateConfig: getFirstAssociateConfig,
    getFirstAssociateSftpConfig:getFirstAssociateSftpConfig,
};
function getFirstAssociateConfig() {
    const firstAssociateConfig =  {
        csvPath: path.join(process.cwd(), '/firstAssociatesUpload'),
        sftpServer: "sftp.1stassociates.com",
        sftpUserName: "masset",
        sftpPassword: "M#a$s!",
        sftpPort: 3235,
        sftpRemoteUploadFolder: "Boarding FILES TEST",

        sftpRetries: 5,
        sftpRetryMinTimeout: 2000,
        sftpAlgorithms: {
            serverHostKey: ['ssh-rsa', 'ssh-dss']
        },
        enabled: false
    };

    if( process.env.NODE_ENV === "production" || process.env.NODE_ENV === "staging" ) {
        firstAssociateConfig.csvPath =  path.join(process.cwd(), '/firstAssociatesUpload');
        firstAssociateConfig.sftpRemoteUploadFolder = "Boarding Files";
        firstAssociateConfig.enabled = true;
    }else {
        firstAssociateConfig.enabled = false;
    }
    return firstAssociateConfig;
}
function getFirstAssociateSftpConfig() {
    const firstAssociateConfig = getFirstAssociateConfig();
    return {
        host: firstAssociateConfig.sftpServer,
        port: firstAssociateConfig.sftpPort,
        username: firstAssociateConfig.sftpUserName,
        password: firstAssociateConfig.sftpPassword,
        retries: firstAssociateConfig.sftpRetries,
        retry_minTimeout: firstAssociateConfig.sftpRetryMinTimeout,
        algorithms: firstAssociateConfig.sftpAlgorithms
    }
}
