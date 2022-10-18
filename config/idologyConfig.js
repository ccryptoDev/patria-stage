module.exports.idologyConfig = {
	getIdologyConfig: getIdologyConfig
};

function getIdologyConfig() {
	const idologyConfig = {
                username: 'patriaaapi',
                password: '@9KEQap88kQaQ3uBF',
                emailVerificationURL: 'https://web.idologylive.com/api/email-standalone.svc',
                phoneVerificationURL: 'https://web.idologylive.com/api/verify-standalone.svc',
        };
        
        // if( process.env.NODE_ENV == "production" ) {
        //         idologyConfig.password = 'Patria2020!';
        // }

	return idologyConfig;
}

