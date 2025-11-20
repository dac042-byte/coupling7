import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all matches for current user
router.get('/', authenticateToken, (req, res) => {
  db.all(
    `SELECT m.id as match_id, m.created_at,
            u.id, u.name, u.user_type, u.country, u.university, u.bio, u.rating
     FROM matches m
     JOIN users u ON (u.id = m.user1_id OR u.id = m.user2_id)
     WHERE (m.user1_id = ? OR m.user2_id = ?)
     AND u.id != ?
     ORDER BY m.created_at DESC`,
    [req.userId, req.userId, req.userId],
    (err, matches) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      // For each match, get the last message
      const promises = matches.map(match => {
        return new Promise((resolve) => {
          db.get(
            `SELECT message, created_at, sender_id
             FROM messages
             WHERE match_id = ?
             ORDER BY created_at DESC
             LIMIT 1`,
            [match.match_id],
            (err, lastMessage) => {
              // Get unread count
              db.get(
                'SELECT COUNT(*) as unread FROM messages WHERE match_id = ? AND sender_id != ? AND read = 0',
                [match.match_id, req.userId],
                (err, unreadCount) => {
                  resolve({
                    matchId: match.match_id,
                    user: {
                      id: match.id,
                      name: match.name,
                      userType: match.user_type,
                      country: match.country,
                      university: match.university,
                      bio: match.bio,
                      rating: match.rating
                    },
                    lastMessage: lastMessage ? {
                      message: lastMessage.message,
                      createdAt: lastMessage.created_at,
                      isFromMe: lastMessage.sender_id === req.userId
                    } : null,
                    unreadCount: unreadCount?.unread || 0,
                    createdAt: match.created_at
                  });
                }
              );
            }
          );
        });
      });

      Promise.all(promises).then(matchesWithMessages => {
        res.json(matchesWithMessages);
      });
    }
  );
});

export default router;
