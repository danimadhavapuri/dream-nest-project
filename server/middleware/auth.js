const jwt = require("jsonwebtoken");

/**
 * Middleware to verify JWT authentication token
 * Ensures that protected routes can only be accessed by authenticated users
 */
const verifyToken = async (req, res, next) => {
  try {
    let token = req.header("Authorization");

    if (!token) {
      return res.status(401).json({ message: "Access Denied: No token provided" });
    }

    if (token.startsWith("Bearer ")) {
      token = token.slice(7, token.length).trimLeft();
    }

    const verified = jwt.verify(token, process.env.JWT_SECRET || "PASSWORDSECRET_DREAMS_NEST_TOP1PCT_2026");
    req.user = verified;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Invalid or expired token", error: err.message });
  }
};

module.exports = { verifyToken };
