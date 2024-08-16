const jwt = require("jsonwebtoken");

// Secret key used for signing and verifying JWT tokens
const jwtSecret = "your_jwt_secret";

// Middleware function to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  // Get the token from the request headers
  const token = req.headers["x-auth-token"];
  
  // If no token is provided, return a 401 Unauthorized status
  if (token === null) return res.sendStatus(401);
  
  // Verify the token using the secret key
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      console.log(err); // Log any error that occurs during verification
      return res.sendStatus(403); 
    }
    
    // Attach the decoded user information to the request object
    req.user = user;
    
    next();
  });
};

exports.authenticateToken = authenticateToken;
