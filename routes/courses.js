const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all courses
router.get('/', async (req, res) => {
  try {
    const [courses] = await pool.execute(`
      SELECT c.*, COUNT(DISTINCT m.id) AS module_count, COUNT(DISTINCT t.id) AS task_count
      FROM courses c
      LEFT JOIN modules m ON c.id = m.course_id
      LEFT JOIN tasks t ON m.id = t.module_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch courses' });
  }
});

// Get course details (with modules/tasks and enrollment + task completion if auth)
router.get('/:id', authenticateOptional, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user?.userId || null;

    const [courses] = await pool.execute('SELECT * FROM courses WHERE id = ?', [courseId]);
    if (!courses.length) return res.status(404).json({ error: 'Course not found' });

    const [modules] = await pool.execute(`
      SELECT m.id AS module_id, m.title AS module_title, m.description AS module_description, m.order_index AS module_order,
             t.id AS task_id, t.title AS task_title, t.description AS task_description, t.resource_url, t.task_type, t.order_index AS task_order,
             up.completed AS task_completed
      FROM modules m
      LEFT JOIN tasks t ON m.id = t.module_id
      LEFT JOIN user_progress up ON t.id = up.task_id AND up.user_id = ?
      WHERE m.course_id = ?
      ORDER BY m.order_index, t.order_index
    `, [userId, courseId]);

    const moduleMap = {};
    modules.forEach(r => {
      if (!moduleMap[r.module_id]) {
        moduleMap[r.module_id] = {
          id: r.module_id,
          title: r.module_title,
          description: r.module_description,
          order_index: r.module_order,
          tasks: []
        };
      }
      if (r.task_id) {
        moduleMap[r.module_id].tasks.push({
          id: r.task_id,
          title: r.task_title,
          description: r.task_description,
            resource_url: r.resource_url,
          task_type: r.task_type,
          order_index: r.task_order,
          completed: !!r.task_completed
        });
      }
    });

    const course = courses[0];
    course.modules = Object.values(moduleMap);

    if (userId) {
      const [enroll] = await pool.execute('SELECT progress FROM user_courses WHERE user_id = ? AND course_id = ?', [userId, courseId]);
      course.enrolled = enroll.length > 0;
      course.progress = enroll.length ? enroll[0].progress : 0;
    }

    res.json(course);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch course details' });
  }
});

// Enroll
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.userId;

    const [existing] = await pool.execute('SELECT id FROM user_courses WHERE user_id = ? AND course_id = ?', [userId, courseId]);
    if (existing.length) return res.status(400).json({ error: 'Already enrolled in this course' });

    await pool.execute('INSERT INTO user_courses (user_id, course_id) VALUES (?,?)', [userId, courseId]);
    res.json({ message: 'Successfully enrolled in course' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to enroll in course' });
  }
});

// Generate certificate
router.post('/:id/certificate', authenticateToken, async (req, res) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.userId;

    // Check if course is completed
    const [prog] = await pool.execute('SELECT progress FROM user_courses WHERE user_id = ? AND course_id = ?', [userId, courseId]);
    if (!prog.length || prog[0].progress !== 100) {
      return res.status(400).json({ error: 'Course not completed yet' });
    }

    // Check if certificate already exists
    const [existing] = await pool.execute('SELECT certificate_id FROM certificates WHERE user_id = ? AND course_id = ?', [userId, courseId]);
    if (existing.length) {
      return res.json({ 
        message: 'Certificate already exists', 
        certificateId: existing[0].certificate_id, 
        studentName: req.user.username, 
        courseTitle: 'Course' 
      });
    }

    // Get user and course info
    const [userResult] = await pool.execute('SELECT username FROM users WHERE id = ?', [userId]);
    const [courseResult] = await pool.execute('SELECT title FROM courses WHERE id = ?', [courseId]);
    
    if (!userResult.length || !courseResult.length) {
      return res.status(400).json({ error: 'User or course not found' });
    }

    const user = userResult[0];
    const course = courseResult[0];
    const certificateId = `CERT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    await pool.execute('INSERT INTO certificates (certificate_id, user_id, course_id, student_name, course_title, completion_date) VALUES (?,?,?,?,?,?)', [
      certificateId,
      userId,
      courseId,
      user.username,
      course.title,
      new Date().toISOString().split('T')[0]
    ]);

    res.json({ message: 'Certificate generated', certificateId, studentName: user.username, courseTitle: course.title });
  } catch (err) {
    console.error('Certificate generation error:', err);
    res.status(500).json({ error: 'Failed to generate certificate' });
  }
});

// Optional auth middleware for GET course detail
function authenticateOptional(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return next();
  const token = authHeader.split(' ')[1];
  if (!token) return next();
  try {
    const { verifyToken } = require('../config/auth');
    req.user = verifyToken(token);
  } catch (_) { /* ignore */ }
  next();
}

module.exports = router;