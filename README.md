# 💜 Coupling

**Connect. Collaborate. Create.**

Coupling is a Tinder-style marketplace that connects ambitious students for project collaboration. It bridges the gap between non-technical idea makers and technical engineers, making it easy to find the perfect co-founder or collaborator.

## 🌟 Features

### Core Functionality
- **Smart Matching**: Technical users only match with non-technical users and vice versa
- **Swipe Interface**: Familiar Tinder-style swiping to discover potential collaborators
- **Real-time Chat**: Message matched users to discuss projects and ideas
- **Rich Profiles**:
  - Technical users: Showcase skills, previous projects, GitHub, portfolio
  - Non-technical users: Present project ideas with timelines, equity offerings, and required skills

### User Experience
- **Dual Theme System**: Toggle between dark purple and light pink themes
- **Modern & Cozy UI**: Beautiful, intuitive interface with smooth animations
- **Swipe Limits**: 20 swipes per day (free tier) with premium upgrade option
- **Rating System**: Rate collaborators after working together
- **Feedback System**: Help us improve the platform

### Premium Features (Planned)
- Unlimited swipes
- See who likes you
- Advanced filters
- Priority matching

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Seed the database with placeholder users**
```bash
npm run seed
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to `http://localhost:3000`

### Test Accounts

You can sign in with any of these pre-seeded accounts:

**Technical Users:**
- Email: `alex.chen@university.edu` - Full-stack developer with AI projects
- Email: `sarah.m@stanford.edu` - Mobile app developer
- Email: `james.wilson@berkeley.edu` - Backend engineer
- Email: `priya.p@cmu.edu` - ML engineer
- Email: `marcus.j@gatech.edu` - Game developer
- Email: `e.zhang@cornell.edu` - DevOps engineer

**Non-Technical Users:**
- Email: `david.b@harvard.edu` - Fintech ideas
- Email: `jessica.l@yale.edu` - Healthcare innovation
- Email: `m.anderson@upenn.edu` - Social media platform ideas
- Email: `rachel.g@duke.edu` - Sustainability projects
- Email: `kevin.n@columbia.edu` - Gig economy marketplace
- Email: `olivia.t@northwestern.edu` - Content platform ideas

**Password for all accounts:** `password123`

## 🏗️ Technology Stack

### Backend
- **Express.js**: Web server framework
- **SQLite3**: Database (as specified, not better-sqlite3)
- **bcryptjs**: Password hashing
- **jsonwebtoken**: Authentication
- **cookie-parser**: Session management

### Frontend
- **Vanilla JavaScript**: No framework overhead, pure performance
- **Modern CSS**: CSS Grid, Flexbox, CSS Variables
- **Responsive Design**: Works on desktop and mobile

### Architecture
- **Integrated Stack**: Frontend and backend on same host
- **RESTful API**: Clean API design
- **Session-based Auth**: Secure cookie-based authentication

## 📁 Project Structure

```
coupling7/
├── server/
│   ├── index.js              # Express server entry point
│   ├── database.js           # SQLite database setup
│   ├── seed.js               # Database seeding script
│   ├── middleware/
│   │   └── auth.js           # JWT authentication middleware
│   └── routes/
│       ├── auth.js           # Authentication routes
│       ├── users.js          # User profile routes
│       ├── swipes.js         # Swipe/like routes
│       ├── matches.js        # Match management
│       ├── messages.js       # Chat messaging
│       └── feedback.js       # User feedback
├── client/
│   └── public/
│       ├── index.html        # Main app HTML
│       ├── privacy.html      # Privacy policy
│       ├── styles.css        # Theme-aware styles
│       └── app.js            # Frontend application logic
└── package.json              # Project dependencies
```

## 🎨 Themes

Coupling includes two beautiful color schemes:

### Dark Theme (Purple)
- Deep purple backgrounds
- Vibrant purple accents
- Perfect for late-night coding sessions

### Light Theme (Pink)
- Soft pink pastels
- Warm, inviting atmosphere
- Easy on the eyes during the day

Toggle themes using the moon/sun button in the top right corner!

## 💡 How It Works

1. **Sign Up**: Create an account and specify if you're technical or non-technical
2. **Build Profile**: Add your skills and projects, or your ideas and timelines
3. **Discover**: Swipe through potential collaborators of the opposite type
4. **Match**: When both users like each other, it's a match!
5. **Chat**: Discuss your ideas and start building together
6. **Collaborate**: Create amazing projects with your new team

## 🔒 Privacy & Security

- Passwords are hashed using bcrypt
- JWT-based authentication
- HTTPS recommended for production
- Comprehensive privacy policy at `/privacy`
- No data selling - ever!

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/:userId` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/projects` - Add project (technical)
- `POST /api/users/ideas` - Add idea (non-technical)
- `GET /api/users/discover/potential` - Get potential matches

### Swipes
- `POST /api/swipes` - Record a swipe
- `GET /api/swipes/likes` - See who liked you (premium)

### Matches
- `GET /api/matches` - Get all matches

### Messages
- `GET /api/messages/:matchId` - Get messages for a match
- `POST /api/messages/:matchId` - Send a message

### Feedback
- `POST /api/feedback` - Submit feedback

## 🚢 Deployment

### Environment Variables
Create a `.env` file for production:
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Production Build
```bash
npm run build
npm start
```

### Deployment Platforms
- **Heroku**: Easy deployment with automatic SSL
- **Vercel**: Great for static frontend + serverless functions
- **DigitalOcean**: Full control with VPS
- **Railway**: Modern, simple deployment

## 📝 Business Model

### Free Tier
- 20 swipes per day
- Unlimited matches
- Full chat access
- Basic profile features

### Premium ($2/month)
- Unlimited swipes
- See who likes you
- Priority in discovery
- Advanced profile features
- Badge on profile

### Future Monetization
- Advertisements (non-intrusive)
- Premium tiers
- Featured profiles
- Success stories showcase

## 🎯 Target Users

### Primary Market
- College students (undergraduate and graduate)
- University email verification for exclusivity

### Potential Expansion
- High school students (with parental consent)
- Recent graduates (within 2 years)
- Coding bootcamp students

## 🤝 Contributing

This is a startup project. If you're interested in contributing or joining the team, please reach out!

## 📧 Contact & Feedback

- Use the in-app feedback feature (Profile → Send Feedback)
- Email: feedback@coupling.app (placeholder - set up real email)

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Inspired by Tinder's swipe interface
- Fiverr's marketplace model
- The amazing student developer community

---

**Built with 💜 for ambitious students who want to create amazing things together.**

*"The best way to predict the future is to build it." - Together.*
