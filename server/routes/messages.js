import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get messages for a match
router.get('/:matchId', authenticateToken, (req, res) => {
  const { matchId } = req.params;

  // Verify user is part of the match
  db.get(
    'SELECT user1_id, user2_id FROM matches WHERE id = ?',
    [matchId],
    (err, match) => {
      if (err || !match) {
        return res.status(404).json({ error: 'Match not found' });
      }

      if (match.user1_id !== req.userId && match.user2_id !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Get messages
      db.all(
        `SELECT m.id, m.message, m.sender_id, m.created_at, m.read,
                u.name as sender_name
         FROM messages m
         JOIN users u ON m.sender_id = u.id
         WHERE m.match_id = ?
         ORDER BY m.created_at ASC`,
        [matchId],
        (err, messages) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          // Mark messages as read
          db.run(
            'UPDATE messages SET read = 1 WHERE match_id = ? AND sender_id != ?',
            [matchId, req.userId]
          );

          res.json(messages.map(msg => ({
            id: msg.id,
            message: msg.message,
            senderId: msg.sender_id,
            senderName: msg.sender_name,
            createdAt: msg.created_at,
            read: msg.read,
            isFromMe: msg.sender_id === req.userId
          })));
        }
      );
    }
  );
});

// Send a message
router.post('/:matchId', authenticateToken, (req, res) => {
  const { matchId } = req.params;
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  // Verify user is part of the match
  db.get(
    'SELECT user1_id, user2_id FROM matches WHERE id = ?',
    [matchId],
    (err, match) => {
      if (err || !match) {
        return res.status(404).json({ error: 'Match not found' });
      }

      if (match.user1_id !== req.userId && match.user2_id !== req.userId) {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      // Insert message
      db.run(
        'INSERT INTO messages (match_id, sender_id, message) VALUES (?, ?, ?)',
        [matchId, req.userId, message.trim()],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to send message' });
          }

          res.status(201).json({
            id: this.lastID,
            message: message.trim(),
            senderId: req.userId,
            createdAt: new Date().toISOString(),
            read: false
          });
        }
      );
    }
  );
});

export default router;
