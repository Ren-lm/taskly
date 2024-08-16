const jwt = require("jsonwebtoken");

const jwtSecret = "your_jwt_secret";

const authenticateToken = (req, res, next) => {
  const token = req.headers["x-auth-token"];
  if (token === null) return res.sendStatus(401);
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

exports.authenticateToken = authenticateToken;
