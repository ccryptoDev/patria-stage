"use strict";

module.exports.api = {
	bearerToken: getBearerToken()
};
function getBearerToken() {
	if( process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod" ) {
		return "VWMlKjtqZnp4dF57cmdSeCI9X05NeS5tNV91ckZARzc=";
	}else {
		return "5b12ca4dbdeecce8a3fd2e950be5103f15622064ff2a3e0cd17decd8fa2709b2";
	}
}
