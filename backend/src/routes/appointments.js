const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const db = require("../config/database");

/**
 * Generate unique 5-character meeting ID
 */
function generateMeetingId() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create Jitsi meeting link
 */
function createJitsiLink(meetingId) {
  return `https://meet.jit.si/${meetingId}`;
}

/**
 * Format appointment with safe JSON parsing and doctor fields
 */
function formatAppointment(apt) {
  if (!apt) return null;

  let languages = ['English'];
  let certifications = [];

  try {
    if (apt.languages && apt.languages !== '[object Object]') {
      languages = JSON.parse(apt.languages);
    }
  } catch (e) {
    console.warn(`Invalid JSON in languages for appointment ${apt.id}:`, apt.languages);
  }

  try {
    if (apt.certifications && apt.certifications !== '[object Object]') {
      certifications = JSON.parse(apt.certifications);
    }
  } catch (e) {
    console.warn(`Invalid JSON in certifications for appointment ${apt.id}:`, apt.certifications);
  }

  return {
    ...apt,
    symptoms: JSON.parse(apt.symptoms || '[]'),
    languages,
    certifications,
    verified: apt.verified === 1,
    available: apt.available === 1
  };
}

/**
 * Create a new appointment
 * POST /api/appointments
 */
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { doctor_id, scheduled_at, notes, symptoms } = req.body;

    // Validate required fields
    if (!doctor_id || !scheduled_at) {
      return res.status(400).json({
        error: "Doctor ID and scheduled time are required",
      });
    }

    // Verify doctor exists
    const doctor = await db.get("SELECT id, name FROM users WHERE id = ? AND role = 'doctor'", [doctor_id]);
    if (!doctor) {
      return res.status(400).json({
        error: "Invalid doctor ID",
      });
    }

    // Generate unique ID for consultation
    const crypto = require('crypto');
    const consultationId = crypto.randomBytes(16).toString('hex');

    // Generate unique meeting link
    const meetingId = generateMeetingId();
    const meetingLink = createJitsiLink(meetingId);

    // Prepare symptoms data
    const symptomsJson = Array.isArray(symptoms) ? JSON.stringify(symptoms) : '[]';

    // Insert appointment into database
    await db.run(
      `INSERT INTO consultations (id, customer_id, doctor_id, type, status, scheduled_at, duration, symptoms, notes, meeting_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [consultationId, req.user.id, doctor_id, "video", "scheduled", scheduled_at, 30, symptomsJson, notes || "", meetingLink]
    );

    // Fetch the created appointment with doctor details
    const appointment = await db.get(
      `SELECT c.*,
              u_customer.name as customer_name,
              u_doctor.name as doctor_name,
              d.specialization,
              d.experience,
              d.languages,
              d.availability as available,
              d.rating,
              d.consultation_fee,
              d.license_number,
              d.verified,
              d.bio,
              d.certifications
       FROM consultations c
       LEFT JOIN users u_customer ON c.customer_id = u_customer.id
       LEFT JOIN users u_doctor ON c.doctor_id = u_doctor.id
       LEFT JOIN doctors d ON c.doctor_id = d.id
       WHERE c.id = ?`,
      [consultationId]
    );

    const responseData = formatAppointment(appointment);

    res.status(201).json({
      message: "Appointment scheduled successfully",
      data: responseData,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      error: "Failed to create appointment",
      details: error.message
    });
  }
});

/**
 * Get all appointments for the current user
 * GET /api/appointments
 */
router.get("/", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Filter appointments based on user role
    let query = `
      SELECT c.*,
             u_customer.name as customer_name,
             u_doctor.name as doctor_name,
             d.specialization,
             d.experience,
             d.languages,
             d.availability as available,
             d.rating,
             d.consultation_fee,
             d.license_number,
             d.verified,
             d.bio,
             d.certifications
      FROM consultations c
      LEFT JOIN users u_customer ON c.customer_id = u_customer.id
      LEFT JOIN users u_doctor ON c.doctor_id = u_doctor.id
      LEFT JOIN doctors d ON c.doctor_id = d.id
      WHERE 1=1
    `;

    const params = [];

    if (userRole === "doctor") {
      query += " AND c.doctor_id = ?";
      params.push(userId);
    } else if (userRole === "manager") {
      // Managers can see all appointments
      // No additional filter needed
    } else {
      query += " AND c.customer_id = ?";
      params.push(userId);
    }

    query += " ORDER BY c.scheduled_at DESC";

    const appointments = await db.all(query, params);

    const userAppointments = appointments.map(formatAppointment);

    res.json({
      data: userAppointments,
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      error: "Failed to fetch appointments",
    });
  }
});

/**
 * Get a specific appointment by ID
 * GET /api/appointments/:id
 */
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await db.get(
      `SELECT c.*,
              u_customer.name as customer_name,
              u_doctor.name as doctor_name,
              d.specialization,
              d.experience,
              d.languages,
              d.availability as available,
              d.rating,
              d.consultation_fee,
              d.license_number,
              d.verified,
              d.bio,
              d.certifications
       FROM consultations c
       LEFT JOIN users u_customer ON c.customer_id = u_customer.id
       LEFT JOIN users u_doctor ON c.doctor_id = u_doctor.id
       LEFT JOIN doctors d ON c.doctor_id = d.id
       WHERE c.id = ?`,
      [id]
    );

    if (!appointment) {
      return res.status(404).json({
        error: "Appointment not found",
      });
    }

    // Check if user has access to this appointment
    const currentUserId = req.user.id;
    const hasAccess =
      appointment.doctor_id === currentUserId ||
      appointment.customer_id === currentUserId;

    if (!hasAccess && req.user.role !== 'manager') {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    const responseData = formatAppointment(appointment);

    res.json({
      data: responseData,
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({
      error: "Failed to fetch appointment",
    });
  }
});

/**
 * Update appointment status
 * PATCH /api/appointments/:id
 */
router.patch("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Check if appointment exists
    const appointment = await db.get("SELECT * FROM consultations WHERE id = ?", [id]);

    if (!appointment) {
      return res.status(404).json({
        error: "Appointment not found",
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (status) {
      updates.push("status = ?");
      params.push(status);
    }
    if (notes !== undefined) {
      updates.push("notes = ?");
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: "No fields to update",
      });
    }

    params.push(id);

    await db.run(
      `UPDATE consultations SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    // Fetch updated appointment
    const updatedAppointment = await db.get(
      `SELECT c.*,
              u_customer.name as customer_name,
              u_doctor.name as doctor_name,
              d.specialization,
              d.experience,
              d.languages,
              d.availability as available,
              d.rating,
              d.consultation_fee,
              d.license_number,
              d.verified,
              d.bio,
              d.certifications
       FROM consultations c
       LEFT JOIN users u_customer ON c.customer_id = u_customer.id
       LEFT JOIN users u_doctor ON c.doctor_id = u_doctor.id
       LEFT JOIN doctors d ON c.doctor_id = d.id
       WHERE c.id = ?`,
      [id]
    );

    res.json({
      message: "Appointment updated successfully",
      data: formatAppointment(updatedAppointment),
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      error: "Failed to update appointment",
    });
  }
});

/**
 * Delete/Cancel an appointment
 * DELETE /api/appointments/:id
 */
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await db.get("SELECT * FROM consultations WHERE id = ?", [id]);

    if (!appointment) {
      return res.status(404).json({
        error: "Appointment not found",
      });
    }

    // Check if user has permission to delete
    const userId = req.user.id;
    const canDelete =
      appointment.customer_id === userId || req.user.role === "manager";

    if (!canDelete) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    // Delete appointment
    await db.run("DELETE FROM consultations WHERE id = ?", [id]);

    res.json({
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({
      error: "Failed to delete appointment",
    });
  }
});

module.exports = router;
