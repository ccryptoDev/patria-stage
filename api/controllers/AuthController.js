const { validateUser, decodeToken } = require('../../auth-utils');
const jwt = require('jsonwebtoken');
const _ = require("lodash");
const Screentracking = require('../models/Screentracking');
const { SendError } = require('../services/ErrorHandling');

const { env } = sails.config;
const secret = env.TOKEN_SECRET;
const ttl = env.TOKEN_TTL;
console.log("testing: ", { env }, process.env.NODE_ENV);
const sign = pl => jwt.sign(pl, secret, { expiresIn: ttl });

module.exports = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const userDocument = await User.findOne({ email });

      const user = await validateUser(userDocument, email, password);
      if (!user) return res.send(403, { info: 'email or password incorrect' });

      const query = {
        user: user.id,
        isCompleted: false
      }
      const screentracking = await Screentracking.getScreenTracking(query, [])

      const payload = {
        user: _.pick(user, ["id", "email"]),
        screenTrackingId: screentracking.id,
      };

      const jwt = sign(payload);

      return res.send({ token: jwt });
    } catch (error) {
      console.log("LOGIN::ERROR:", error);
      SendError(error);
    }

  },
  decodeToken: (req, res) => {
    const authHeader = req.headers['authorization'];
    const data = decodeToken(authHeader);
    console.log("decodeToken first=", data);
    return res.json(data);
  },
};

