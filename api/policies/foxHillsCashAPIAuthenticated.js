/**
 * Created by vishal on 5/10/16.
 */

module.exports = function (req, res, next) {
	const remoteAddr = ( req.headers[ "x-forwarded-for" ] || req.headers[ "x-real-ip" ] || req.connection.remoteAddress ).replace( "::ffff:", "" ).replace( /^::1$/, "127.0.0.1" );
	sails.log.verbose("foxHillsCashApiAuthenticated:  Checking if api is authenticated for. Requesting IP address: " + remoteAddr );
	if(isAuthenticated(req)) {
		sails.log.verbose("foxHillsCashApiAuthenticated:  Authentication was successful. Requesting IP address: " + remoteAddr );
		return next();
	}else {
		sails.log.error("foxHillsCashApiAuthenticated:  Authentication was failed. Requesting IP address: " + remoteAddr );
		const errorMessage = "You are not authenticated.";
		if(req.headers[ "content-type" ] === "text/xml" || req.headers[ "content-type" ] === "application/xml" ){
			const xmlResponse = `<EXTRESPONSETRANSACTION><SUCCESS>0</SUCCESS><MESSAGE>${errorMessage}</MESSAGE></EXTRESPONSETRANSACTION>`;
			res.type("application/xml").status(401).send(xmlResponse)
		}else {
			return res.type("application/json").json( { message: "You are not authenticated." }, 401 );
		}
	}
};
function isAuthenticated(req) {
	let authorization = req.headers[ "authorization" ];
	if( !authorization ) {
		authorization = "";
	}
	const token = authorization.toLocaleString().indexOf("Bearer ") >= 0? authorization.split( "Bearer " )[ 1 ]: null;
	sails.log.error( "startRequestAction.authentication; token:", token );
	return !!token && token === sails.config.api.bearerToken;
}
