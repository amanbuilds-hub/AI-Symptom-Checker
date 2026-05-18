const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const db = require("../config/database");

/**
 * Get all conversations (active chats) for the current logged-in user
 * GET /api/messages/conversations
 */
router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    let query = "";
    if (userRole === "doctor") {
      // Find all consultations for this doctor, join patient name
      query = `
        SELECT c.id as consultation_id, c.scheduled_at, c.status,
               u.id as other_user_id, u.name as other_user_name, u.email as other_user_email,
               (SELECT content FROM messages WHERE consultation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
               (SELECT created_at FROM messages WHERE consultation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
        FROM consultations c
        JOIN users u ON c.customer_id = u.id
        WHERE c.doctor_id = ?
        ORDER BY last_message_time DESC, c.scheduled_at DESC
      `;
    } else {
      // Find all consultations for this customer/patient, join doctor name
      query = `
        SELECT c.id as consultation_id, c.scheduled_at, c.status,
               u.id as other_user_id, u.name as other_user_name, u.email as other_user_email,
               (SELECT content FROM messages WHERE consultation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
               (SELECT created_at FROM messages WHERE consultation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
        FROM consultations c
        JOIN users u ON c.doctor_id = u.id
        WHERE c.customer_id = ?
        ORDER BY last_message_time DESC, c.scheduled_at DESC
      `;
    }

    const conversations = await db.all(query, [userId]);
    res.json({ data: conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

/**
 * Get all messages for a specific consultation/chat
 * GET /api/messages/consultation/:consultationId
 */
router.get("/consultation/:consultationId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { consultationId } = req.params;

    // Enforce authorization check: Must be doctor or customer for this consultation
    const consultation = await db.get(
      "SELECT id, doctor_id, customer_id FROM consultations WHERE id = ?",
      [consultationId]
    );

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    if (consultation.doctor_id !== userId && consultation.customer_id !== userId) {
      return res.status(403).json({ error: "Unauthorized access to this chat session" });
    }

    const messages = await db.all(
      `SELECT m.*, u.name as sender_name 
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.consultation_id = ?
       ORDER BY m.created_at ASC`,
      [consultationId]
    );

    res.json({ data: messages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

/**
 * Send a new message inside a specific consultation/chat
 * POST /api/messages/consultation/:consultationId
 */
router.post("/consultation/:consultationId", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { consultationId } = req.params;
    const { content, message_type } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Message content is required" });
    }

    // Verify participant authorization
    const consultation = await db.get(
      "SELECT id, doctor_id, customer_id FROM consultations WHERE id = ?",
      [consultationId]
    );

    if (!consultation) {
      return res.status(404).json({ error: "Consultation not found" });
    }

    if (consultation.doctor_id !== userId && consultation.customer_id !== userId) {
      return res.status(403).json({ error: "Unauthorized to send messages to this chat session" });
    }

    const crypto = require("crypto");
    const messageId = crypto.randomBytes(16).toString("hex");
    const senderType = userRole === "doctor" ? "doctor" : "customer";

    await db.run(
      `INSERT INTO messages (id, consultation_id, sender_id, sender_type, content, message_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [messageId, consultationId, userId, senderType, content, message_type || "text"]
    );

    const createdMessage = await db.get(
      "SELECT * FROM messages WHERE id = ?",
      [messageId]
    );

    res.status(201).json({
      message: "Message sent successfully",
      data: createdMessage
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
