import express from 'express';
import db from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get user profile with projects/ideas
router.get('/:userId', authenticateToken, (req, res) => {
  const { userId } = req.params;

  db.get(
    'SELECT id, name, user_type, country, university, bio, rating, rating_count FROM users WHERE id = ?',
    [userId],
    (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userProfile = {
        id: user.id,
        name: user.name,
        userType: user.user_type,
        country: user.country,
        university: user.university,
        bio: user.bio,
        rating: user.rating,
        ratingCount: user.rating_count
      };

      if (user.user_type === 'technical') {
        // Get technical profile and previous projects
        db.get(
          'SELECT skills, github_url, portfolio_url FROM technical_profiles WHERE user_id = ?',
          [userId],
          (err, profile) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            db.all(
              'SELECT id, title, description, tech_stack, project_url FROM previous_projects WHERE user_id = ? ORDER BY created_at DESC',
              [userId],
              (err, projects) => {
                if (err) return res.status(500).json({ error: 'Database error' });

                userProfile.skills = profile?.skills || '';
                userProfile.githubUrl = profile?.github_url || '';
                userProfile.portfolioUrl = profile?.portfolio_url || '';
                userProfile.previousProjects = projects || [];

                res.json(userProfile);
              }
            );
          }
        );
      } else {
        // Get non-technical profile and project ideas
        db.get(
          'SELECT industry FROM non_technical_profiles WHERE user_id = ?',
          [userId],
          (err, profile) => {
            if (err) return res.status(500).json({ error: 'Database error' });

            db.all(
              'SELECT id, title, description, timeline, equity_offering, payment_available, required_skills FROM project_ideas WHERE user_id = ? ORDER BY created_at DESC',
              [userId],
              (err, ideas) => {
                if (err) return res.status(500).json({ error: 'Database error' });

                userProfile.industry = profile?.industry || '';
                userProfile.projectIdeas = ideas || [];

                res.json(userProfile);
              }
            );
          }
        );
      }
    }
  );
});

// Update user profile
router.put('/profile', authenticateToken, (req, res) => {
  const { bio, skills, githubUrl, portfolioUrl, industry } = req.body;

  db.get('SELECT user_type FROM users WHERE id = ?', [req.userId], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update bio
    if (bio !== undefined) {
      db.run('UPDATE users SET bio = ? WHERE id = ?', [bio, req.userId]);
    }

    // Update type-specific profile
    if (user.user_type === 'technical') {
      db.run(
        'UPDATE technical_profiles SET skills = ?, github_url = ?, portfolio_url = ? WHERE user_id = ?',
        [skills || '', githubUrl || '', portfolioUrl || '', req.userId],
        (err) => {
          if (err) return res.status(500).json({ error: 'Failed to update profile' });
          res.json({ message: 'Profile updated successfully' });
        }
      );
    } else {
      db.run(
        'UPDATE non_technical_profiles SET industry = ? WHERE user_id = ?',
        [industry || '', req.userId],
        (err) => {
          if (err) return res.status(500).json({ error: 'Failed to update profile' });
          res.json({ message: 'Profile updated successfully' });
        }
      );
    }
  });
});

// Add previous project (technical users)
router.post('/projects', authenticateToken, (req, res) => {
  const { title, description, techStack, projectUrl } = req.body;

  if (!title || !description || !techStack) {
    return res.status(400).json({ error: 'Title, description, and tech stack are required' });
  }

  db.run(
    'INSERT INTO previous_projects (user_id, title, description, tech_stack, project_url) VALUES (?, ?, ?, ?, ?)',
    [req.userId, title, description, techStack, projectUrl || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add project' });
      }
      res.status(201).json({ id: this.lastID, message: 'Project added successfully' });
    }
  );
});

// Add project idea (non-technical users)
router.post('/ideas', authenticateToken, (req, res) => {
  const { title, description, timeline, equityOffering, paymentAvailable, requiredSkills } = req.body;

  if (!title || !description || !timeline) {
    return res.status(400).json({ error: 'Title, description, and timeline are required' });
  }

  db.run(
    `INSERT INTO project_ideas (user_id, title, description, timeline, equity_offering, payment_available, required_skills)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [req.userId, title, description, timeline, equityOffering || '', paymentAvailable ? 1 : 0, requiredSkills || ''],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to add project idea' });
      }
      res.status(201).json({ id: this.lastID, message: 'Project idea added successfully' });
    }
  );
});

// Get potential matches (users of opposite type)
router.get('/discover/potential', authenticateToken, (req, res) => {
  db.get('SELECT user_type FROM users WHERE id = ?', [req.userId], (err, currentUser) => {
    if (err || !currentUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    const oppositeType = currentUser.user_type === 'technical' ? 'non-technical' : 'technical';

    // Get users of opposite type that haven't been swiped yet
    db.all(
      `SELECT u.id, u.name, u.user_type, u.country, u.university, u.bio, u.rating, u.rating_count
       FROM users u
       WHERE u.user_type = ?
       AND u.id != ?
       AND u.id NOT IN (
         SELECT swiped_id FROM swipes WHERE swiper_id = ?
       )
       ORDER BY RANDOM()
       LIMIT 20`,
      [oppositeType, req.userId, req.userId],
      (err, users) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // For each user, get their projects or ideas
        const promises = users.map(user => {
          return new Promise((resolve) => {
            if (user.user_type === 'technical') {
              db.all(
                'SELECT id, title, description, tech_stack, project_url FROM previous_projects WHERE user_id = ?',
                [user.id],
                (err, projects) => {
                  db.get(
                    'SELECT skills, github_url, portfolio_url FROM technical_profiles WHERE user_id = ?',
                    [user.id],
                    (err, profile) => {
                      resolve({
                        ...user,
                        userType: user.user_type,
                        ratingCount: user.rating_count,
                        previousProjects: projects || [],
                        skills: profile?.skills || '',
                        githubUrl: profile?.github_url || '',
                        portfolioUrl: profile?.portfolio_url || ''
                      });
                    }
                  );
                }
              );
            } else {
              db.all(
                'SELECT id, title, description, timeline, equity_offering, payment_available, required_skills FROM project_ideas WHERE user_id = ?',
                [user.id],
                (err, ideas) => {
                  db.get(
                    'SELECT industry FROM non_technical_profiles WHERE user_id = ?',
                    [user.id],
                    (err, profile) => {
                      resolve({
                        ...user,
                        userType: user.user_type,
                        ratingCount: user.rating_count,
                        projectIdeas: ideas || [],
                        industry: profile?.industry || ''
                      });
                    }
                  );
                }
              );
            }
          });
        });

        Promise.all(promises).then(profiles => {
          res.json(profiles);
        });
      }
    );
  });
});

export default router;
