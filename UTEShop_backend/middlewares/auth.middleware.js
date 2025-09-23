const jwt = require("jsonwebtoken");

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers["authorization"] || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      console.warn("Auth missing token for", req.method, req.originalUrl);
      return res.status(401).json({ message: "Unauthorized" });
    }
    const secret = process.env.JWT_SECRET || "dev_jwt_secret_change_me";
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    return next();
  } catch (err) {
    console.warn("Auth invalid token:", err?.message || err);
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = { authenticateJWT };



