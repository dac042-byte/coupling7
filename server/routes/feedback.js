import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Submit feedback
router.post('/', authenticateToken, (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Feedback message is required' });
  }

  db.run(
    'INSERT INTO feedback (user_id, message) VALUES (?, ?)',
    [req.userId, message.trim()],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to submit feedback' });
      }
      res.status(201).json({ message: 'Thank you for your feedback!' });
    }
  );
});

// Anonymous feedback (no auth required)
router.post('/anonymous', (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Feedback message is required' });
  }

  db.run(
    'INSERT INTO feedback (user_id, message) VALUES (NULL, ?)',
    [message.trim()],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to submit feedback' });
      }
      res.status(201).json({ message: 'Thank you for your feedback!' });
    }
  );
});

export default router;
