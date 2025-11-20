import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Swipe on a user
router.post('/', authenticateToken, (req, res) => {
  const { swipedId, liked } = req.body;

  if (!swipedId || liked === undefined) {
    return res.status(400).json({ error: 'Swiped user ID and liked status are required' });
  }

  // Check swipes remaining
  db.get('SELECT swipes_remaining, is_premium FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.swipes_remaining <= 0 && !user.is_premium) {
      return res.status(403).json({ error: 'No swipes remaining. Upgrade to premium or wait for reset.' });
    }

    // Verify users are of opposite types
    db.get(
      `SELECT u1.user_type as swiper_type, u2.user_type as swiped_type
       FROM users u1, users u2
       WHERE u1.id = ? AND u2.id = ?`,
      [req.userId, swipedId],
      (err, types) => {
        if (err || !types) {
          return res.status(400).json({ error: 'Invalid user' });
        }

        if (types.swiper_type === types.swiped_type) {
          return res.status(400).json({ error: 'Can only match with users of opposite type' });
        }

        // Record swipe
        db.run(
          'INSERT OR REPLACE INTO swipes (swiper_id, swiped_id, liked) VALUES (?, ?, ?)',
          [req.userId, swipedId, liked ? 1 : 0],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Failed to record swipe' });
            }

            // Decrease swipes remaining if not premium
            if (!user.is_premium) {
              db.run('UPDATE users SET swipes_remaining = swipes_remaining - 1 WHERE id = ?', [req.userId]);
            }

            // Check for match if liked
            if (liked) {
              db.get(
                'SELECT id FROM swipes WHERE swiper_id = ? AND swiped_id = ? AND liked = 1',
                [swipedId, req.userId],
                (err, mutualLike) => {
                  if (mutualLike) {
                    // Create match
                    const [user1, user2] = [req.userId, swipedId].sort((a, b) => a - b);
                    db.run(
                      'INSERT OR IGNORE INTO matches (user1_id, user2_id) VALUES (?, ?)',
                      [user1, user2],
                      function(err) {
                        if (err) {
                          return res.json({ matched: false, message: 'Swipe recorded' });
                        }
                        res.json({ matched: true, matchId: this.lastID, message: 'It\'s a match!' });
                      }
                    );
                  } else {
                    res.json({ matched: false, message: 'Swipe recorded' });
                  }
                }
              );
            } else {
              res.json({ matched: false, message: 'Swipe recorded' });
            }
          }
        );
      }
    );
  });
});

// Get who liked me (premium feature)
router.get('/likes', authenticateToken, (req, res) => {
  db.get('SELECT is_premium FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.is_premium) {
      return res.status(403).json({ error: 'Premium feature only' });
    }

    db.all(
      `SELECT u.id, u.name, u.user_type, u.country, u.university, u.bio
       FROM swipes s
       JOIN users u ON s.swiper_id = u.id
       WHERE s.swiped_id = ? AND s.liked = 1
       AND NOT EXISTS (
         SELECT 1 FROM swipes s2
         WHERE s2.swiper_id = ? AND s2.swiped_id = s.swiper_id
       )`,
      [req.userId, req.userId],
      (err, users) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(users);
      }
    );
  });
});

export default router;
