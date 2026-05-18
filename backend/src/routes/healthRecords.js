const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const db = require("../config/database");

// Ensure patient_metrics table exists in SQLite database
(async () => {
  try {
    await db.run(`
      CREATE TABLE IF NOT EXISTS patient_metrics (
        patient_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        blood_pressure TEXT DEFAULT '120/80',
        heart_rate TEXT DEFAULT '72 bpm',
        weight TEXT DEFAULT '65 kg',
        last_checkup TEXT DEFAULT '10 days ago',
        updated_by_doctor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ patient_metrics table initialized successfully");
  } catch (err) {
    console.error("❌ Error initializing patient_metrics table:", err);
  }
})();

/**
 * Fetch patient metrics for the logged-in customer (patient)
 * GET /api/health-records/metrics
 */
router.get("/metrics", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    if (userRole !== "customer") {
      return res.status(403).json({ error: "Access denied. Patient role required." });
    }

    let metrics = await db.get("SELECT * FROM patient_metrics WHERE patient_id = ?", [userId]);

    if (!metrics) {
      // Create default metrics if they don't exist
      await db.run(
        `INSERT INTO patient_metrics (patient_id, blood_pressure, heart_rate, weight, last_checkup)
         VALUES (?, '120/80', '72 bpm', '65 kg', '10 days ago')`,
        [userId]
      );
      metrics = await db.get("SELECT * FROM patient_metrics WHERE patient_id = ?", [userId]);
    }

    res.json({ data: metrics });
  } catch (error) {
    console.error("Error fetching patient metrics:", error);
    res.status(500).json({ error: "Failed to fetch patient metrics" });
  }
});

/**
 * Fetch patient metrics for a specific patient ID (accessible by authorized doctor)
 * GET /api/health-records/metrics/:patientId
 */
router.get("/metrics/:patientId", authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const userRole = req.user.role;
    const { patientId } = req.params;

    if (userRole !== "doctor" && req.user.id !== patientId) {
      return res.status(403).json({ error: "Access denied." });
    }

    if (userRole === "doctor") {
      // ENFORCE relationship check: verify if doctor has a consultation with this patient
      const consultation = await db.get(
        "SELECT id FROM consultations WHERE doctor_id = ? AND customer_id = ? LIMIT 1",
        [doctorId, patientId]
      );

      if (!consultation) {
        return res.status(403).json({
          error: "Permission denied. You can only view metrics of patients with whom you have a consultation."
        });
      }
    }

    let metrics = await db.get("SELECT * FROM patient_metrics WHERE patient_id = ?", [patientId]);

    if (!metrics) {
      // Create defaults
      await db.run(
        `INSERT INTO patient_metrics (patient_id, blood_pressure, heart_rate, weight, last_checkup)
         VALUES (?, '120/80', '72 bpm', '65 kg', '10 days ago')`,
        [patientId]
      );
      metrics = await db.get("SELECT * FROM patient_metrics WHERE patient_id = ?", [patientId]);
    }

    res.json({ data: metrics });
  } catch (error) {
    console.error("Error fetching patient metrics by ID:", error);
    res.status(500).json({ error: "Failed to fetch patient metrics" });
  }
});

/**
 * Update patient metrics for a patient (only accessible by their assigned doctor)
 * POST /api/health-records/metrics/:patientId
 */
router.post("/metrics/:patientId", authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const userRole = req.user.role;
    const { patientId } = req.params;
    const { blood_pressure, heart_rate, weight, last_checkup } = req.body;

    if (userRole !== "doctor") {
      return res.status(403).json({ error: "Access denied. Only doctors can update health metrics." });
    }

    // Enforce relationship-based check!
    const consultation = await db.get(
      "SELECT id FROM consultations WHERE doctor_id = ? AND customer_id = ? LIMIT 1",
      [doctorId, patientId]
    );

    if (!consultation) {
      return res.status(403).json({
        error: "Permission denied. You can only edit metrics for patients with whom you have a consultation."
      });
    }

    // Insert or update patient metrics
    const existing = await db.get("SELECT patient_id FROM patient_metrics WHERE patient_id = ?", [patientId]);

    if (existing) {
      await db.run(
        `UPDATE patient_metrics 
         SET blood_pressure = ?, heart_rate = ?, weight = ?, last_checkup = ?, updated_by_doctor_id = ?, updated_at = CURRENT_TIMESTAMP
         WHERE patient_id = ?`,
        [blood_pressure || "120/80", heart_rate || "72 bpm", weight || "65 kg", last_checkup || "Today", doctorId, patientId]
      );
    } else {
      await db.run(
        `INSERT INTO patient_metrics (patient_id, blood_pressure, heart_rate, weight, last_checkup, updated_by_doctor_id)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [patientId, blood_pressure || "120/80", heart_rate || "72 bpm", weight || "65 kg", last_checkup || "Today", doctorId]
      );
    }

    const updatedMetrics = await db.get("SELECT * FROM patient_metrics WHERE patient_id = ?", [patientId]);

    res.json({
      message: "Health metrics updated successfully",
      data: updatedMetrics
    });
  } catch (error) {
    console.error("Error updating patient metrics:", error);
    res.status(500).json({ error: "Failed to update health metrics", details: error.message });
  }
});

/**
 * Get all health records for the current user
 * GET /api/health-records
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = `
      SELECT hr.*, 
             c.scheduled_at as consultation_date,
             u_doctor.name as doctor_name
      FROM health_records hr
      LEFT JOIN consultations c ON hr.consultation_id = c.id
      LEFT JOIN users u_doctor ON c.doctor_id = u_doctor.id
      WHERE hr.customer_id = ?
      ORDER BY hr.created_at DESC
    `;

    const params = [userId];

    const records = await db.all(query, params);

    // Parse JSON fields
    const parsedRecords = records.map(rec => ({
      ...rec,
      data: JSON.parse(rec.data || '{}'),
      attachments: JSON.parse(rec.attachments || '[]')
    }));

    res.json({
      data: parsedRecords
    });
  } catch (error) {
    console.error("Error fetching health records:", error);
    res.status(500).json({
      error: "Failed to fetch health records"
    });
  }
});

/**
 * Create a new health record
 * POST /api/health-records
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, type, description, data, attachments } = req.body;

    if (!title || !type) {
      return res.status(400).json({
        error: "Title and type are required"
      });
    }

    // Generate unique ID for health record
    const crypto = require('crypto');
    const recordId = crypto.randomBytes(16).toString('hex');

    const dataJson = data ? JSON.stringify(data) : '{}';
    const attachmentsJson = attachments ? JSON.stringify(attachments) : '[]';

    // Insert into database
    await db.run(
      `INSERT INTO health_records (id, customer_id, type, title, description, data, attachments)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [recordId, req.user.id, type, title, description || "", dataJson, attachmentsJson]
    );

    // Fetch the created record
    const createdRecord = await db.get(
      "SELECT * FROM health_records WHERE id = ?",
      [recordId]
    );

    res.status(201).json({
      message: "Health record created successfully",
      data: {
        ...createdRecord,
        data: JSON.parse(createdRecord.data || '{}'),
        attachments: JSON.parse(createdRecord.attachments || '[]')
      }
    });
  } catch (error) {
    console.error("Error creating health record:", error);
    res.status(500).json({
      error: "Failed to create health record",
      details: error.message
    });
  }
});

/**
 * Get all health records of a specific patient (for authorized doctor)
 * GET /api/health-records/patient/:patientId
 */
router.get("/patient/:patientId", authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const userRole = req.user.role;
    const { patientId } = req.params;

    if (userRole !== "doctor") {
      return res.status(403).json({ error: "Access denied. Only doctors can view patient health records." });
    }

    // Enforce relationship-based check!
    const consultation = await db.get(
      "SELECT id FROM consultations WHERE doctor_id = ? AND customer_id = ? LIMIT 1",
      [doctorId, patientId]
    );

    if (!consultation) {
      return res.status(403).json({
        error: "Permission denied. You can only view health records for patients with whom you have a consultation."
      });
    }

    // Get the patient's contact information (email, phone, etc.) as well to show in dashboard!
    const patientInfo = await db.get(
      "SELECT id, name, email, phone FROM users WHERE id = ?",
      [patientId]
    );

    let query = `
      SELECT hr.*, 
             c.scheduled_at as consultation_date,
             u_doctor.name as doctor_name
      FROM health_records hr
      LEFT JOIN consultations c ON hr.consultation_id = c.id
      LEFT JOIN users u_doctor ON c.doctor_id = u_doctor.id
      WHERE hr.customer_id = ?
      ORDER BY hr.created_at DESC
    `;

    const records = await db.all(query, [patientId]);

    // Parse JSON fields
    const parsedRecords = records.map(rec => ({
      ...rec,
      data: JSON.parse(rec.data || '{}'),
      attachments: JSON.parse(rec.attachments || '[]')
    }));

    res.json({
      patient: patientInfo,
      data: parsedRecords
    });
  } catch (error) {
    console.error("Error fetching patient health records:", error);
    res.status(500).json({
      error: "Failed to fetch patient health records"
    });
  }
});

/**
 * Create a new health record for a specific patient (by their authorized doctor)
 * POST /api/health-records/patient/:patientId
 */
router.post("/patient/:patientId", authenticateToken, async (req, res) => {
  try {
    const doctorId = req.user.id;
    const userRole = req.user.role;
    const { patientId } = req.params;
    const { title, type, description, data, attachments } = req.body;

    if (userRole !== "doctor") {
      return res.status(403).json({ error: "Access denied. Only doctors can add patient health records." });
    }

    if (!title || !type) {
      return res.status(400).json({ error: "Title and type are required" });
    }

    // Enforce relationship-based check!
    const consultation = await db.get(
      "SELECT id FROM consultations WHERE doctor_id = ? AND customer_id = ? LIMIT 1",
      [doctorId, patientId]
    );

    if (!consultation) {
      return res.status(403).json({
        error: "Permission denied. You can only create records for patients with whom you have a consultation."
      });
    }

    // Generate unique ID for health record
    const crypto = require('crypto');
    const recordId = crypto.randomBytes(16).toString('hex');

    const dataJson = data ? JSON.stringify(data) : '{}';
    const attachmentsJson = attachments ? JSON.stringify(attachments) : '[]';

    // Insert into database
    await db.run(
      `INSERT INTO health_records (id, customer_id, type, title, description, data, attachments)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [recordId, patientId, type, title, description || "", dataJson, attachmentsJson]
    );

    // Fetch the created record
    const createdRecord = await db.get(
      "SELECT * FROM health_records WHERE id = ?",
      [recordId]
    );

    res.status(201).json({
      message: "Health record created successfully",
      data: {
        ...createdRecord,
        data: JSON.parse(createdRecord.data || '{}'),
        attachments: JSON.parse(createdRecord.attachments || '[]')
      }
    });
  } catch (error) {
    console.error("Error creating health record for patient:", error);
    res.status(500).json({
      error: "Failed to create health record",
      details: error.message
    });
  }
});

module.exports = router;
