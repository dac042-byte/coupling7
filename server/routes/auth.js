import express from 'express';
import bcrypt from 'bcryptjs';
import db from '../database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Sign up
router.post('/signup', async (req, res) => {
  const { email, password, name, userType, country, university, bio } = req.body;

  // Validate required fields
  if (!email || !password || !name || !userType || !country || !university) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (userType !== 'technical' && userType !== 'non-technical') {
    return res.status(400).json({ error: 'Invalid user type' });
  }

  try {
    // Check if user already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (row) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      db.run(
        `INSERT INTO users (email, password, name, user_type, country, university, bio)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [email, hashedPassword, name, userType, country, university, bio || ''],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' });
          }

          const userId = this.lastID;

          // Create type-specific profile
          if (userType === 'technical') {
            db.run(
              'INSERT INTO technical_profiles (user_id, skills) VALUES (?, ?)',
              [userId, ''],
              (err) => {
                if (err) console.error('Failed to create technical profile:', err);
              }
            );
          } else {
            db.run(
              'INSERT INTO non_technical_profiles (user_id, industry) VALUES (?, ?)',
              [userId, ''],
              (err) => {
                if (err) console.error('Failed to create non-technical profile:', err);
              }
            );
          }

          // Generate token
          const token = generateToken(userId, userType);

          res.cookie('token', token, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            sameSite: 'lax'
          });

          res.status(201).json({
            message: 'User created successfully',
            user: { id: userId, email, name, userType, country, university },
            token
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Sign in
router.post('/signin', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user.id, user.user_type);

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax'
    });

    res.json({
      message: 'Signed in successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        country: user.country,
        university: user.university,
        isPremium: user.is_premium
      },
      token
    });
  });
});

// Sign out
router.post('/signout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Signed out successfully' });
});

// Get current user
router.get('/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, name, user_type, country, university, bio, swipes_remaining, is_premium, rating, rating_count FROM users WHERE id = ?',
    [req.userId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type,
        country: user.country,
        university: user.university,
        bio: user.bio,
        swipesRemaining: user.swipes_remaining,
        isPremium: user.is_premium,
        rating: user.rating,
        ratingCount: user.rating_count
      });
    }
  );
});

export default router;
