/**
 * HTTP Server Settings
 * (sails.config.http)
 *
 * Configuration for the underlying HTTP server in Sails.
 * Only applies to HTTP requests (not WebSockets)
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.http.html
 */
const { authMiddleware } = require('../auth-utils');

module.exports.http = {
  /** **************************************************************************
   *                                                                           *
   * Express middleware to use for every Sails request. To add custom          *
   * middleware to the mix, add a function to the middleware config object and *
   * add its key to the "order" array. The $custom key is reserved for         *
   * backwards-compatibility with Sails v0.9.x apps that use the               *
   * `customMiddleware` config option.                                         *
   *                                                                           *
   ****************************************************************************/

  middleware: {
    passportInit: require("passport").initialize(),
    passportSession: require("passport").session(),

    /* refreshSessionCookie: function(req, res, next) {
        req.session._garbage = Date();
        req.session.touch();
        return next();
    },*/

    /** *************************************************************************
     *                                                                          *
     * The order in which middleware should be run for HTTP request. (the Sails *
     * router is invoked by the "router" middleware below.)                     *
     *                                                                          *
     ***************************************************************************/

    order: [
      "startRequestTimer",
      "cookieParser",
      "session",
      // 'refreshSessionCookie',
      "myRequestLogger",
      "authMiddleware",
      "passportInit",
      "passportSession",
      "bodyParser",
      "handleBodyParserError",
      "compress",
      "methodOverride",
      "poweredBy",
      "$custom",
      "router",
      "www",
      "favicon",
      "404",
      "500"
    ],

    /** **************************************************************************
     *                                                                           *
     * Example custom middleware; logs each request to the console.              *
     *                                                                           *
     ****************************************************************************/

    myRequestLogger: function (req, res, next) {
      res.header("Cache-Control", "private, must-revalidate");
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
      res.header('Allow', 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD');
      res.header('X-Powered-By', '');
      return next();
    },

    authMiddleware: (_ => authMiddleware)(),
    // authMiddleware,

		bodyParser: (function() {
			// Get an XML parser instance
			var xmlParser = require('express-xml-bodyparser')({explicitArray: false});
			var skipper = require('skipper')({});
				return (req,res,next) => {
						if( req.headers && (req.headers['content-type'] === 'text/xml' || req.headers['content-type'] === 'application/xml')) {
							return xmlParser( req, res, next );
						} else {
							return skipper( req, res, next );
						}
				}
		})(),
		handleBodyParserError: (errorObj,req,res,next) => {
			if(errorObj){
				handleError(errorObj,req,res);
			}else {
				handleError({message: "An unknown error occurred."},req,res);
			}
		},
		/** *************************************************************************
		 *                                                                          *
		 * The body parser that will handle incoming multipart HTTP requests. By    *
		 * default as of v0.10, Sails uses                                          *
		 * [skipper](http://github.com/balderdashy/skipper). See                    *
		 * http://www.senchalabs.org/connect/multipart.html for other options.      *
		 *                                                                          *
		 ***************************************************************************/
		// bodyParser: require('skipper')
	},


  /** *************************************************************************
   *                                                                          *
   * The number of seconds to cache flat files on disk being served by        *
   * Express static middleware (by default, these files are in `.tmp/public`) *
   *                                                                          *
   * The HTTP static cache is only active in a 'production' environment,      *
   * since that's the only time Express will cache flat-files.                *
   *                                                                          *
   ***************************************************************************/

  cache: 31557600000
};

function handleError(errorObj, req, res) {
  if (req.headers && (req.headers['content-type'] === 'text/xml' || req.headers['content-type'] === 'application/xml')) {
    const xmlResponse = `<EXTRESPONSETRANSACTION><SUCCESS>0</SUCCESS><MESSAGE>${errorObj.message.replace(/(\r\n|\n|\r)/gm, " ")}</MESSAGE></EXTRESPONSETRANSACTION>`;
    res.type("application/xml").status(500).send(xmlResponse)
  } else {
    res.type("application/json").status(500).send({ message: errorObj.message });
  }
}
