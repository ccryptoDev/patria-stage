var path = require('path');

const fs = require("fs");
module.exports.dcInsightsConfig = {
    getDcInsightsConfig: getDcInsightsConfig,
    getDcInsightsSftpConfig:getDcInsightsSftpConfig,
};
function getDcInsightsConfig() {
    const dcInsightsConfig =  {
        companyName: "FOX_HILLS_CASH_TEST",
        csvPath: path.join(process.cwd(), '/dcInsightsUpload'),
        sftpServer: "sftp.decision.cloud",

        // sftpUsePkiAuth: false,
        //
        // sftpUserName: "test-sftp",
        sftpUsePkiAuth: true,
        sftpPrivateKey: path.join(process.cwd(), 'dcvalchemy'),

        sftpUserName: "dcvalchemy",
        sftpPassword: "hY5hr3Cw4QoHkaZUtio",

        sftpPort: 22,
        sftpRemoteUploadFolder: "Staging DCInsights",
        sftpPullRemoteUploadFolder: "output",
        sftpRetries: 5,
        sftpRetryMinTimeout: 2000,
        sftpAlgorithms: {
            serverHostKey: ['ssh-rsa', 'ssh-dss']
        },
        enabled: true,
        uploadToSftpEnabled: false,
    };

    if( process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod" ) {
        dcInsightsConfig.companyName = "FOX_HILLS_CASH";
        dcInsightsConfig.sftpServer = "sftp.decision.cloud";
        dcInsightsConfig.sftpRemoteUploadFolder = "DCInsights";
        dcInsightsConfig.enabled = true;
        dcInsightsConfig.uploadToSftpEnabled = true;
        dcInsightsConfig.sftpUsePkiAuth = true;
        dcInsightsConfig.sftpUserName = "dcvalchemy";
        dcInsightsConfig.sftpPrivateKey = path.join(process.cwd(), 'dcvalchemy');
    }

    return dcInsightsConfig;
}
function getDcInsightsSftpConfig() {
    const dcInsightsConfig = getDcInsightsConfig();
    const config = {
        host: dcInsightsConfig.sftpServer,
        port: dcInsightsConfig.sftpPort,
        username: dcInsightsConfig.sftpUserName,
        password: dcInsightsConfig.sftpPassword,
        retries: dcInsightsConfig.sftpRetries,
        retry_minTimeout: dcInsightsConfig.sftpRetryMinTimeout,
        algorithms: dcInsightsConfig.sftpAlgorithms,
    };
    if(dcInsightsConfig.sftpUsePkiAuth) {
        config["privateKey"] = fs.readFileSync(dcInsightsConfig.sftpPrivateKey);
        delete config["password"]
    }
    return config;
}
