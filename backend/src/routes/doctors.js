const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const db = require('../config/database');

/**
 * Get all doctors
 * GET /api/doctors
 */
router.get('/', async (req, res) => {
  try {
    const { available, specialization } = req.query;

    // Build SQL query
    let sql = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.location,
        d.specialization,
        d.experience,
        d.languages,
        d.availability as available,
        d.rating,
        d.consultation_fee,
        d.license_number,
        d.verified,
        d.bio
      FROM users u
      INNER JOIN doctors d ON u.id = d.id
      WHERE u.role = 'doctor'
    `;

    const params = [];

    // Filter by availability if specified
    if (available !== undefined) {
      const isAvailable = available === 'true' ? 1 : 0;
      sql += ` AND d.availability = ?`;
      params.push(isAvailable);
    }

    // Filter by specialization if specified
    if (specialization) {
      sql += ` AND d.specialization LIKE ?`;
      params.push(`%${specialization}%`);
    }

    sql += ` ORDER BY d.rating DESC, u.name ASC`;

    const doctors = await db.all(sql, params);

    // Parse JSON fields
    const formattedDoctors = doctors.map(doc => {
      let languages = ['English'];
      try {
        if (doc.languages && doc.languages !== '[object Object]') {
          languages = JSON.parse(doc.languages);
        }
      } catch (e) {
        console.warn(`Invalid JSON in languages for doctor ${doc.id}:`, doc.languages);
      }

      return {
        id: doc.id,
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        location: doc.location,
        specialization: doc.specialization,
        experience: `${doc.experience} years`,
        languages,
        available: doc.available === 1,
        rating: doc.rating || 0,
        consultation_fee: doc.consultation_fee || 0,
        license_number: doc.license_number,
        verified: doc.verified === 1,
        bio: doc.bio
      };
    });

    res.json({
      data: formattedDoctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      error: 'Failed to fetch doctors'
    });
  }
});

/**
 * Get a specific doctor by ID
 * GET /api/doctors/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.location,
        d.specialization,
        d.experience,
        d.languages,
        d.availability as available,
        d.rating,
        d.consultation_fee,
        d.license_number,
        d.verified,
        d.bio,
        d.education,
        d.certifications,
        d.working_hours
      FROM users u
      INNER JOIN doctors d ON u.id = d.id
      WHERE u.id = ? AND u.role = 'doctor'
    `;

    const doctor = await db.get(sql, [id]);

    if (!doctor) {
      return res.status(404).json({
        error: 'Doctor not found'
      });
    }

    // Format response - safely parse JSON fields
    let languages = ['English'];
    let education = [];
    let certifications = [];
    let working_hours = {};

    try {
      if (doctor.languages && doctor.languages !== '[object Object]') {
        languages = JSON.parse(doctor.languages);
      }
    } catch (e) {
      console.warn(`Invalid JSON in languages for doctor ${doctor.id}`);
    }

    try {
      if (doctor.education && doctor.education !== '[object Object]') {
        education = JSON.parse(doctor.education);
      }
    } catch (e) {
      console.warn(`Invalid JSON in education for doctor ${doctor.id}`);
    }

    try {
      if (doctor.certifications && doctor.certifications !== '[object Object]') {
        certifications = JSON.parse(doctor.certifications);
      }
    } catch (e) {
      console.warn(`Invalid JSON in certifications for doctor ${doctor.id}`);
    }

    try {
      if (doctor.working_hours && doctor.working_hours !== '[object Object]') {
        working_hours = JSON.parse(doctor.working_hours);
      }
    } catch (e) {
      console.warn(`Invalid JSON in working_hours for doctor ${doctor.id}`);
    }

    const formattedDoctor = {
      id: doctor.id,
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone,
      location: doctor.location,
      specialization: doctor.specialization,
      experience: `${doctor.experience} years`,
      languages,
      available: doctor.available === 1,
      rating: doctor.rating || 0,
      consultation_fee: doctor.consultation_fee || 0,
      license_number: doctor.license_number,
      verified: doctor.verified === 1,
      bio: doctor.bio,
      education,
      certifications,
      working_hours
    };

    res.json({
      data: formattedDoctor
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({
      error: 'Failed to fetch doctor'
    });
  }
});

/**
 * Update doctor availability (Manager or the Doctor themselves)
 * PATCH /api/doctors/:id
 */
router.patch('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { available, rating, consultation_fee, bio, specialization, experience } = req.body;

    // Check if doctor exists
    const doctor = await db.get("SELECT * FROM doctors WHERE id = ?", [id]);
    if (!doctor) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    // Check if user has permission (Manager or the Doctor themselves)
    if (req.user.role !== 'manager' && req.user.id !== id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (available !== undefined) {
      updates.push("availability = ?");
      params.push(available ? 1 : 0);
    }
    if (rating !== undefined) {
      updates.push("rating = ?");
      params.push(rating);
    }
    if (consultation_fee !== undefined) {
      updates.push("consultation_fee = ?");
      params.push(consultation_fee);
    }
    if (bio !== undefined) {
      updates.push("bio = ?");
      params.push(bio);
    }
    if (specialization !== undefined) {
      updates.push("specialization = ?");
      params.push(specialization);
    }
    if (experience !== undefined) {
      updates.push("experience = ?");
      params.push(experience);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    params.push(id);

    await db.run(
      `UPDATE doctors SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      params
    );

    res.json({ message: 'Doctor updated successfully' });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

/**
 * Delete a doctor (Manager only)
 * DELETE /api/doctors/:id
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is a manager
    if (req.user.role !== 'manager') {
      return res.status(403).json({ error: 'Only managers can delete doctors' });
    }

    const { id } = req.params;
    
    // Deleting the user will cascade delete the doctor profile
    await db.run("DELETE FROM users WHERE id = ? AND role = 'doctor'", [id]);

    res.json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});

module.exports = router;
