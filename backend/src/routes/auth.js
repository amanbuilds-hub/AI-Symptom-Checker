const express = require("express");
const { body, validationResult } = require("express-validator");
const db = require("../config/database");
const AuthUtils = require("../utils/auth");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Validation rules
const signupValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("name").trim().isLength({ min: 2 }),
  body("phone").optional().isMobilePhone(),
  body("role").optional().isIn(["customer", "doctor"]),
  body("language").optional().isIn(["en", "hi"]),
  body("location").optional().trim().isLength({ min: 2 }),
];

const signinValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty(),
];

// ✅ Sign up
router.post("/signup", signupValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { email, password, name, phone, age, gender, language = "en", location, role = "customer" } = req.body;

    // Check if user already exists
    const existingUser = await db.get("SELECT id FROM users WHERE email = ?", [email]);
    if (existingUser) {
      return res.status(409).json({ error: "User already exists" });
    }

    // Hash password
    const passwordHash = await AuthUtils.hashPassword(password);

    // Insert user
    const userQuery = `
      INSERT INTO users (email, password_hash, name, phone, age, gender, language, location, role)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.run(userQuery, [email, passwordHash, name, phone, age, gender, language, location, role]);

    const user = await db.get(
      "SELECT id, email, name, phone, age, gender, language, location, role, created_at FROM users WHERE email = ?",
      [email]
    );

    // If doctor → create doctor profile
    if (role === "doctor") {
      const doctorQuery = `
        INSERT INTO doctors (id, specialization, experience, languages)
        VALUES (?, ?, ?, ?)
      `;
      await db.run(doctorQuery, [
        user.id,
        "General Practice", // default specialization
        0, // default experience
        JSON.stringify([language]),
      ]);
    }

    // Generate token + session
    const token = AuthUtils.generateToken({ userId: user.id, email: user.email, role: user.role });
    await AuthUtils.createSession(user.id, token);

    res.status(201).json({
      message: "User created successfully",
      user,
      token,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Sign in
router.post("/signin", signinValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: "Validation failed",
        details: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await db.get(
      `SELECT id, email, password_hash, name, phone, age, gender, language, location, role, is_active
       FROM users WHERE email = ?`,
      [email]
    );

    if (!user || !user.is_active) {
      return res.status(401).json({ error: "Invalid credentials or account inactive" });
    }

    // Check password
    const isValidPassword = await AuthUtils.comparePassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token + session
    const token = AuthUtils.generateToken({ userId: user.id, email: user.email, role: user.role });
    await AuthUtils.createSession(user.id, token);

    delete user.password_hash;
    res.json({ message: "Login successful", user, token });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Sign out
router.post("/signout", authenticateToken, async (req, res) => {
  try {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (token) {
      await AuthUtils.invalidateSession(token);
    }
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Signout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Current user
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await db.get(
      `SELECT id, email, name, phone, age, gender, language, location, role, avatar_url, created_at, updated_at
       FROM users WHERE id = ? AND is_active = true`,
      [req.user.id]
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.role === "doctor") {
      const doctorProfile = await db.get("SELECT * FROM doctors WHERE id = ?", [user.id]);
      if (doctorProfile) user.doctor_profile = doctorProfile;
    }

    res.json({ user });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ✅ Update profile
router.put(
  "/profile",
  authenticateToken,
  [
    body("name").optional().trim().isLength({ min: 2 }),
    body("phone").optional().isMobilePhone(),
    body("age").optional().isInt({ min: 1, max: 120 }),
    body("gender").optional().isIn(["male", "female", "other"]),
    body("language").optional().isIn(["en", "hi"]),
    body("location").optional().trim().isLength({ min: 2 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: "Validation failed", details: errors.array() });
      }

      const allowedFields = ["name", "phone", "age", "gender", "language", "location"];
      const updates = {};
      allowedFields.forEach((f) => {
        if (req.body[f] !== undefined) updates[f] = req.body[f];
      });

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No valid fields to update" });
      }

      const setClause = Object.keys(updates).map((key) => `${key} = ?`).join(", ");
      const values = [...Object.values(updates), req.user.id];

      await db.run(
        `UPDATE users SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
        values
      );

      const updatedUser = await db.get(
        "SELECT id, email, name, phone, age, gender, language, location, role, avatar_url, updated_at FROM users WHERE id = ?",
        [req.user.id]
      );

      res.json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
      console.error("Update profile error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
