const express = require('express');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Update task progress
router.post('/task', authenticateToken, async (req, res) => {
  try {
    const { taskId, completed } = req.body;
    if (!taskId || typeof completed === 'undefined') return res.status(400).json({ error: 'taskId and completed required' });
    const userId = req.user.userId;

    await pool.execute(`
      INSERT INTO user_progress (user_id, task_id, completed, completed_at)
      VALUES (?,?,?,?)
      ON DUPLICATE KEY UPDATE completed = VALUES(completed), completed_at = VALUES(completed_at)
    `, [userId, taskId, completed, completed ? new Date() : null]);

    // Get the course ID for this task first
    const [taskCourse] = await pool.execute(`
      SELECT c.id AS course_id
      FROM tasks t
      JOIN modules m ON t.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      WHERE t.id = ?
    `, [taskId]);

    if (!taskCourse.length) {
      return res.status(400).json({ error: 'Task not found' });
    }

    const courseId = taskCourse[0].course_id;

    // Now get progress for the entire course
    const [result] = await pool.execute(`
      SELECT c.id AS course_id, COUNT(t.id) AS total_tasks,
             COUNT(CASE WHEN up.completed = 1 THEN 1 END) AS completed_tasks
      FROM tasks t
      JOIN modules m ON t.module_id = m.id
      JOIN courses c ON m.course_id = c.id
      LEFT JOIN user_progress up ON t.id = up.task_id AND up.user_id = ?
      WHERE c.id = ?
      GROUP BY c.id
    `, [userId, courseId]);

    if (result.length) {
      const { total_tasks, completed_tasks } = result[0];
      const progress = Math.round((completed_tasks / total_tasks) * 100);
      
      // Get current progress before updating (if exists)
      const [currentRecord] = await pool.execute('SELECT progress FROM user_courses WHERE user_id = ? AND course_id = ?', [userId, courseId]);
      const previousProgress = currentRecord[0]?.progress || 0;
      
      // Ensure enrollment row exists
      await pool.execute(`
        INSERT INTO user_courses (user_id, course_id, progress, enrolled_at) 
        VALUES (?, ?, 0, NOW()) 
        ON DUPLICATE KEY UPDATE progress = progress
      `, [userId, courseId]);
      
      // Update progress
      await pool.execute('UPDATE user_courses SET progress = ?, completed_at = ? WHERE user_id = ? AND course_id = ?', [
        progress,
        progress === 100 ? new Date() : null,
        userId,
        courseId
      ]);
      
      // Show popup only when: completing a task AND progress goes from <100 to 100
      const justCompleted = completed && progress === 100 && previousProgress < 100;
      
      return res.json({ 
        message: 'Progress updated', 
        progress, 
        courseCompleted: justCompleted, 
        totalTasks: total_tasks, 
        completedTasks: completed_tasks 
      });
    }
    res.json({ message: 'Progress updated' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

// Get user progress summary
router.get('/my-progress', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const [courses] = await pool.execute(`
      SELECT c.id, c.title, c.description, c.difficulty, c.duration,
             uc.enrolled_at, uc.progress, uc.completed_at
      FROM user_courses uc
      JOIN courses c ON uc.course_id = c.id
      WHERE uc.user_id = ?
      ORDER BY uc.enrolled_at DESC
    `, [userId]);

    const [stats] = await pool.execute(`
      SELECT COUNT(DISTINCT uc.course_id) AS courses_enrolled,
             COUNT(DISTINCT CASE WHEN uc.progress = 100 THEN uc.course_id END) AS courses_completed,
             COUNT(DISTINCT CASE WHEN up.completed = 1 THEN up.task_id END) AS tasks_completed,
             COUNT(DISTINCT cert.id) AS certificates_earned
      FROM user_courses uc
      LEFT JOIN user_progress up ON uc.user_id = up.user_id
      LEFT JOIN certificates cert ON uc.user_id = cert.user_id
      WHERE uc.user_id = ?
    `, [userId]);

    res.json({
      courses,
      stats: stats[0] || { courses_enrolled: 0, courses_completed: 0, tasks_completed: 0, certificates_earned: 0 }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch progress data' });
  }
});

module.exports = router;