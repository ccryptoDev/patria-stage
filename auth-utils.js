const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SendError, ErrorHandler } = require("./api/services/ErrorHandling");


const openRoutes = [
  "/borrower/login",
  "/borrower/view-document",
]

function decodeToken(authHeader) {
  const { config } = sails;
  const secret = config.env.TOKEN_SECRET;
  const token = authHeader && authHeader.split(" ")[1];
  return jwt.verify(token, secret);
}

async function authMiddleware(req, res, next) {
  try {
    const authStr =
      req.headers["authorization"] || req.headers["Authorization"];
    const { config } = sails;
    const secret = config.env.TOKEN_SECRET;
    if (req.method === "OPTIONS") {
      return res.status(204).json();
    }
    console.log("first", req.originalUrl)
    // improve validation
    if (
      req.originalUrl.includes("/v2/") ||
      req.originalUrl.endsWith("/apply/newUser") ||
      req.originalUrl.endsWith("/proceed-rules") ||
      req.originalUrl.startsWith("/borrower/view-document") ||
      req.originalUrl.startsWith("/test/latestPdfReport") ||
      openRoutes.includes(req.originalUrl)
    ) {
      return next();
    }

    if (!authStr) throw new ErrorHandler(401, "UnAuthorized");
    const token = authStr && authStr.split(" ")[1];
    const send401 = (_) => (res.send ? res.send(401) : res.sendStatus(401));

    if (!token) return send401();
    return jwt.verify(token, secret, (err, decoded) => {
      if (err) return send401();
      req.decoded = { screenTrackingId: decoded?.screenTrackingId };
      req.user = decoded.user;
      return next();
    });
  } catch (error) {
    sails.log.error(`AuthUtils ERROR::${error}`);
    SendError(error, res);
  }
}

function onUserCreate(user, cb) {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return cb(err);
      user.password = hash;
      return cb();
    });
  });
}

async function validateUser(user, email, password) {
  if (!user) {
    return null;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return null;
  }

  delete user.password;

  return user;
}

module.exports = { validateUser, onUserCreate, authMiddleware, decodeToken };
