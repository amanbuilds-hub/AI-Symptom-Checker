const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const db = require("../config/database");

// Middleware to enforce manager role
const requireManager = (req, res, next) => {
  if (req.user.role !== "manager") {
    return res.status(403).json({ error: "Access denied. Managers only." });
  }
  next();
};

/**
 * Get unified platform stats (users, active doctors, consultations counts, total revenue)
 * GET /api/analytics/platform-stats
 */
router.get("/platform-stats", authenticateToken, requireManager, async (req, res) => {
  try {
    const totalUsers = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
    const activeDoctors = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'doctor'");
    const consultationsToday = await db.get(
      "SELECT COUNT(*) as count FROM consultations WHERE date(scheduled_at) = date('now')"
    );
    const completedConsultations = await db.get(
      "SELECT COUNT(*) as count FROM consultations WHERE status = 'completed'"
    );
    
    // Sum consultation fees for completed consultations
    const revenueQuery = `
      SELECT SUM(d.consultation_fee) as sum
      FROM consultations c
      JOIN doctors d ON c.doctor_id = d.id
      WHERE c.status = 'completed'
    `;
    const revenue = await db.get(revenueQuery);

    res.json({
      data: {
        totalUsers: totalUsers.count || 0,
        activeDoctors: activeDoctors.count || 0,
        consultationsToday: consultationsToday.count || 0,
        completedConsultations: completedConsultations.count || 0,
        revenue: revenue.sum || 0
      }
    });
  } catch (error) {
    console.error("Error fetching platform stats:", error);
    res.status(500).json({ error: "Failed to load platform statistics" });
  }
});

/**
 * Get daily consultation trends for the last 7 days
 * GET /api/analytics/trends
 */
router.get("/trends", authenticateToken, requireManager, async (req, res) => {
  try {
    // Generate dates for the last 7 days including today
    const trendsQuery = `
      WITH RECURSIVE dates(date) AS (
        VALUES(date('now', '-6 days'))
        UNION ALL
        SELECT date(date, '+1 day') FROM dates WHERE date < date('now')
      )
      SELECT 
        d.date,
        COUNT(c.id) as count
      FROM dates d
      LEFT JOIN consultations c ON date(c.scheduled_at) = d.date
      GROUP BY d.date
      ORDER BY d.date ASC
    `;
    const trends = await db.all(trendsQuery);
    res.json({ data: trends });
  } catch (error) {
    console.error("Error fetching trends:", error);
    res.status(500).json({ error: "Failed to load trends data" });
  }
});

/**
 * Get count of users by their role (growth metric)
 * GET /api/analytics/roles
 */
router.get("/roles", authenticateToken, requireManager, async (req, res) => {
  try {
    const roles = await db.all(
      "SELECT role, COUNT(*) as count FROM users GROUP BY role"
    );
    res.json({ data: roles });
  } catch (error) {
    console.error("Error fetching user roles:", error);
    res.status(500).json({ error: "Failed to load user roles data" });
  }
});

/**
 * Get count of doctors by their specializations
 * GET /api/analytics/specializations
 */
router.get("/specializations", authenticateToken, requireManager, async (req, res) => {
  try {
    const specs = await db.all(
      "SELECT specialization, COUNT(*) as count FROM doctors GROUP BY specialization"
    );
    res.json({ data: specs });
  } catch (error) {
    console.error("Error fetching specializations:", error);
    res.status(500).json({ error: "Failed to load specializations data" });
  }
});

module.exports = router;
