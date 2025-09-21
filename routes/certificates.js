const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get certificate details (must own it)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const certId = req.params.id;
    const userId = req.user.userId;
    const [rows] = await pool.execute(`SELECT certificate_id, student_name, course_title, completion_date, issued_at 
                                       FROM certificates WHERE certificate_id = ? AND user_id = ?`, [certId, userId]);
    if (!rows.length) return res.status(404).json({ error: 'Certificate not found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load certificate' });
  }
});

// Get all user certificates
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(`SELECT certificate_id, course_title, completion_date FROM certificates WHERE user_id = ? ORDER BY issued_at DESC`, [req.user.userId]);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'Failed to load certificates' });
  }
});

module.exports = router;