const jwt = require("jsonwebtoken");
const db = require("../config/database");
const crypto = require("crypto");

// 🔑 Verify access token + check DB session validity
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  try {
    // Decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash the token using sha256 to match the database value
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Check if session exists in DB
    const sessionQuery = `
      SELECT us.id, us.expires_at, u.id as user_id, u.email, u.name, u.role, u.is_active
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.token_hash = ? 
        AND us.expires_at > datetime('now') 
        AND u.is_active = 1
    `;

    const session = await db.get(sessionQuery, [tokenHash]);

    if (!session) {
      return res.status(401).json({ error: "Invalid or expired session" });
    }

    // Attach user to request
    req.user = {
      id: session.user_id,
      email: session.email,
      role: session.role,
      name: session.name,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};

// 👮 Restrict access by role
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }

    next();
  };
};

// 🟢 Optional authentication (guest allowed)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next(); // continue without user
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Hash the token using sha256 to match the database value
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    // Check session
    const sessionQuery = `
      SELECT u.id, u.email, u.role, u.name
      FROM user_sessions us
      JOIN users u ON us.user_id = u.id
      WHERE us.token_hash = ? AND us.expires_at > datetime('now')
    `;

    const session = await db.get(sessionQuery, [tokenHash]);

    if (session) {
      req.user = {
        id: session.id,
        email: session.email,
        role: session.role,
        name: session.name,
      };
    }
  } catch (error) {
    // Ignore invalid token, continue as guest
  }

  next();
};

module.exports = {
  authenticateToken,
  requireRole,
  optionalAuth,
};
