var path = require('path');

const fs = require("fs");
module.exports.ftConfig = {
    getFtConfig,
    getFtSftpConfig
};
function getFtConfig() {
    const ftConfig =  {
        // csvPath: path.join(process.cwd(), '/ftUpload'),
        sftpPrivateKey: path.join(process.cwd(), 'ftprivkey'),

        companyName: "Patria",
        sftpServer: "evaultdsm01.com",

        sftpUsePkiAuth: false,

        sftpUserName: "ev00025_f3d2",
        sftpPassword: "EJqRaRHB2",

        sftpPort: 22,
        sftpRemoteUploadFolder: "/Home/ev00025_f3d2 - Patria",
        sftpPullRemoteUploadFolder: "/Home/ev00025_f3d2 - Patria/Processed",
        sftpRetries: 5,
        sftpRetryMinTimeout: 2000,
        sftpAlgorithms: {
            serverHostKey: ['ssh-rsa', 'ssh-dss']
        },
        enabled: true,
        uploadToSftpEnabled: false,
    };

    // if( process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod" ) {
    // if( true ) {
    //     // ftConfig.companyName = "Proapprove";
    //     ftConfig.sftpServer = "mftgateway.53.com";
    //     ftConfig.sftpPassword = "8RUxoCrE";
    //     // ftConfig.sftpRemoteUploadFolder = "/";
    //     // ftConfig.enabled = true;
    //     // ftConfig.uploadToSftpEnabled = true;
    //     // ftConfig.sftpUsePkiAuth = true;
    //     // ftConfig.sftpUserName = "dcvalchemy";
    //     // ftConfig.sftpPrivateKey = path.join(process.cwd(), 'dcvalchemy');
    // }

    return ftConfig;
}
function getFtSftpConfig() {
    const ftConfig = getFtConfig();
    const config = {
        host: ftConfig.sftpServer,
        port: ftConfig.sftpPort,
        username: ftConfig.sftpUserName,
        password: ftConfig.sftpPassword,
        retries: ftConfig.sftpRetries,
        retry_minTimeout: ftConfig.sftpRetryMinTimeout,
        algorithms: ftConfig.sftpAlgorithms,
    };
    if(ftConfig.sftpUsePkiAuth) {
        config["privateKey"] = fs.readFileSync(ftConfig.sftpPrivateKey);
        // delete config["password"]
    }
    return config;
}
