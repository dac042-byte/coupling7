import bcrypt from 'bcryptjs';
import db from './database.js';

const technicalUsers = [
  {
    name: 'Alex Chen',
    email: 'alex.chen@university.edu',
    password: 'password123',
    country: 'USA',
    university: 'MIT',
    bio: 'Full-stack developer passionate about AI and web technologies. Love building products that make a difference.',
    skills: 'React, Node.js, Python, TensorFlow, PostgreSQL',
    githubUrl: 'https://github.com/alexchen',
    portfolioUrl: 'https://alexchen.dev',
    projects: [
      {
        title: 'AI Study Buddy',
        description: 'An AI-powered study assistant that helps students learn more efficiently using GPT-4 and spaced repetition.',
        techStack: 'React, FastAPI, OpenAI API, PostgreSQL',
        projectUrl: 'https://github.com/alexchen/ai-study-buddy'
      },
      {
        title: 'Campus Food Delivery',
        description: 'A food delivery app specifically designed for college campuses with real-time tracking and group orders.',
        techStack: 'React Native, Node.js, MongoDB, Socket.io',
        projectUrl: 'https://github.com/alexchen/campus-eats'
      }
    ]
  },
  {
    name: 'Sarah Martinez',
    email: 'sarah.m@stanford.edu',
    password: 'password123',
    country: 'USA',
    university: 'Stanford University',
    bio: 'Mobile app developer and UI/UX enthusiast. I love creating beautiful, intuitive experiences.',
    skills: 'Swift, Kotlin, React Native, Figma, Firebase',
    githubUrl: 'https://github.com/sarahmartinez',
    projects: [
      {
        title: 'FitTrack Pro',
        description: 'A comprehensive fitness tracking app with social features and personalized workout plans.',
        techStack: 'Swift, Firebase, HealthKit',
        projectUrl: 'https://github.com/sarahmartinez/fittrack'
      },
      {
        title: 'Budget Buddy',
        description: 'Simple expense tracking app for students with automatic categorization and spending insights.',
        techStack: 'React Native, Node.js, Plaid API',
        projectUrl: 'https://github.com/sarahmartinez/budget-buddy'
      }
    ]
  },
  {
    name: 'James Wilson',
    email: 'j.wilson@berkeley.edu',
    password: 'password123',
    country: 'USA',
    university: 'UC Berkeley',
    bio: 'Backend engineer specializing in distributed systems and cloud infrastructure. AWS certified.',
    skills: 'Go, Kubernetes, AWS, Docker, PostgreSQL, Redis',
    githubUrl: 'https://github.com/jameswilson',
    projects: [
      {
        title: 'Scalable Chat Platform',
        description: 'A horizontally scalable real-time chat system supporting millions of concurrent users.',
        techStack: 'Go, Redis, WebSocket, Kubernetes',
        projectUrl: 'https://github.com/jameswilson/chat-platform'
      }
    ]
  },
  {
    name: 'Priya Patel',
    email: 'priya.p@cmu.edu',
    password: 'password123',
    country: 'USA',
    university: 'Carnegie Mellon University',
    bio: 'ML engineer and data scientist. Building the future with AI, one model at a time.',
    skills: 'Python, TensorFlow, PyTorch, Scikit-learn, SQL',
    githubUrl: 'https://github.com/priyapatel',
    projects: [
      {
        title: 'Sentiment Analyzer',
        description: 'Real-time sentiment analysis tool for social media monitoring using BERT transformers.',
        techStack: 'Python, PyTorch, FastAPI, React',
        projectUrl: 'https://github.com/priyapatel/sentiment-ai'
      },
      {
        title: 'Stock Predictor',
        description: 'ML model for stock price prediction using historical data and news sentiment.',
        techStack: 'Python, TensorFlow, Pandas, Alpha Vantage API',
        projectUrl: 'https://github.com/priyapatel/stock-ml'
      }
    ]
  },
  {
    name: 'Marcus Johnson',
    email: 'marcus.j@gatech.edu',
    password: 'password123',
    country: 'USA',
    university: 'Georgia Tech',
    bio: 'Game developer and graphics programmer. Love creating immersive experiences.',
    skills: 'Unity, C#, C++, Blender, Unreal Engine',
    githubUrl: 'https://github.com/marcusj',
    portfolioUrl: 'https://marcusjohnson.games',
    projects: [
      {
        title: 'Puzzle Quest VR',
        description: 'An immersive VR puzzle game with physics-based mechanics.',
        techStack: 'Unity, C#, Oculus SDK',
        projectUrl: 'https://github.com/marcusj/puzzle-vr'
      }
    ]
  },
  {
    name: 'Emily Zhang',
    email: 'e.zhang@cornell.edu',
    password: 'password123',
    country: 'USA',
    university: 'Cornell University',
    bio: 'DevOps engineer passionate about automation and CI/CD. Making deployments seamless.',
    skills: 'Jenkins, Docker, Kubernetes, Terraform, Python',
    githubUrl: 'https://github.com/emilyzhang',
    projects: [
      {
        title: 'Auto-Deploy Pipeline',
        description: 'Complete CI/CD pipeline template for microservices with automatic testing and deployment.',
        techStack: 'Jenkins, Docker, Kubernetes, ArgoCD',
        projectUrl: 'https://github.com/emilyzhang/auto-deploy'
      }
    ]
  }
];

const nonTechnicalUsers = [
  {
    name: 'David Brown',
    email: 'david.b@harvard.edu',
    password: 'password123',
    country: 'USA',
    university: 'Harvard University',
    bio: 'Economics major with a passion for fintech. Want to revolutionize how students manage money.',
    industry: 'Finance / Fintech',
    ideas: [
      {
        title: 'Student Loan Optimizer',
        description: 'An app that helps students optimize their loan repayment strategies using AI to analyze income projections and suggest the best repayment plans. Would include features like refinancing recommendations and tax optimization.',
        timeline: '3-4 months for MVP',
        equityOffering: '15-20% equity for technical co-founder',
        paymentAvailable: false,
        requiredSkills: 'Full-stack development, financial APIs, data visualization'
      },
      {
        title: 'Campus Micro-Investing',
        description: 'Allow students to invest spare change from everyday purchases into diversified portfolios. Gamified experience with educational content about investing.',
        timeline: '4-5 months',
        equityOffering: '20% equity + revenue share',
        paymentAvailable: false,
        requiredSkills: 'Mobile development, payment APIs, backend systems'
      }
    ]
  },
  {
    name: 'Jessica Lee',
    email: 'jessica.l@yale.edu',
    password: 'password123',
    country: 'USA',
    university: 'Yale University',
    bio: 'Pre-med student passionate about healthcare innovation. Want to make healthcare more accessible.',
    industry: 'Healthcare',
    ideas: [
      {
        title: 'Symptom Checker for Students',
        description: 'A reliable symptom checker specifically designed for college students, integrated with campus health services. Would help students decide if they need to visit health services or can self-care.',
        timeline: '3 months for MVP, 6 months for full launch',
        equityOffering: '25% equity for CTO',
        paymentAvailable: false,
        requiredSkills: 'Mobile app development, healthcare APIs, machine learning'
      }
    ]
  },
  {
    name: 'Michael Anderson',
    email: 'm.anderson@upenn.edu',
    password: 'password123',
    country: 'USA',
    university: 'University of Pennsylvania',
    bio: 'Marketing major obsessed with social media and creator economy. Let\'s build the next big platform.',
    industry: 'Social Media / Marketing',
    ideas: [
      {
        title: 'Campus Influencer Network',
        description: 'A platform connecting student influencers with local businesses for sponsored content. Automated matching based on audience demographics and engagement rates.',
        timeline: '4 months',
        equityOffering: '20% equity',
        paymentAvailable: true,
        requiredSkills: 'Web development, payment processing, analytics dashboard'
      },
      {
        title: 'Video Resume Builder',
        description: 'TikTok-style app for creating professional video resumes. Templates, editing tools, and direct sharing to employers.',
        timeline: '2-3 months',
        equityOffering: '15% equity',
        paymentAvailable: false,
        requiredSkills: 'Mobile development, video processing, cloud storage'
      }
    ]
  },
  {
    name: 'Rachel Green',
    email: 'rachel.g@duke.edu',
    password: 'password123',
    country: 'USA',
    university: 'Duke University',
    bio: 'Environmental Science major. Want to use technology to fight climate change and promote sustainability.',
    industry: 'Sustainability / Environment',
    ideas: [
      {
        title: 'Carbon Footprint Tracker',
        description: 'App that automatically calculates your carbon footprint based on purchases, travel, and activities. Provides personalized recommendations to reduce impact and connects with carbon offset programs.',
        timeline: '5 months',
        equityOffering: '20% equity + potential grants',
        paymentAvailable: false,
        requiredSkills: 'Mobile development, data analytics, API integrations'
      }
    ]
  },
  {
    name: 'Kevin Nguyen',
    email: 'kevin.n@columbia.edu',
    password: 'password123',
    country: 'USA',
    university: 'Columbia University',
    bio: 'Business major interested in the gig economy and future of work.',
    industry: 'Gig Economy / Marketplace',
    ideas: [
      {
        title: 'TaskRabbit for Campus',
        description: 'A marketplace for student services - tutoring, moving help, event photography, etc. Built-in payment, ratings, and background verification.',
        timeline: '3-4 months',
        equityOffering: '18% equity',
        paymentAvailable: true,
        requiredSkills: 'Full-stack development, payment processing, geolocation'
      },
      {
        title: 'Study Group Finder',
        description: 'Algorithm-based matching for study groups based on class, study style, location, and availability. Includes scheduling and virtual meeting integration.',
        timeline: '2 months',
        equityOffering: '10% equity',
        paymentAvailable: false,
        requiredSkills: 'Web development, matching algorithms, calendar APIs'
      }
    ]
  },
  {
    name: 'Olivia Taylor',
    email: 'olivia.t@northwestern.edu',
    password: 'password123',
    country: 'USA',
    university: 'Northwestern University',
    bio: 'Journalism major who loves storytelling. Want to create the future of content creation.',
    industry: 'Media / Content',
    ideas: [
      {
        title: 'Collaborative Writing Platform',
        description: 'Google Docs meets Substack - a platform for collaborative long-form writing with built-in publishing and monetization. Perfect for student publications.',
        timeline: '4 months',
        equityOffering: '15% equity + rev share',
        paymentAvailable: false,
        requiredSkills: 'Real-time collaboration, text editing, payment integration'
      }
    ]
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  // Wait for database to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('DELETE FROM messages');
        db.run('DELETE FROM matches');
        db.run('DELETE FROM swipes');
        db.run('DELETE FROM project_ideas');
        db.run('DELETE FROM previous_projects');
        db.run('DELETE FROM non_technical_profiles');
        db.run('DELETE FROM technical_profiles');
        db.run('DELETE FROM users', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    });

    console.log('✅ Existing data cleared');

    // Seed technical users
    console.log('Creating technical users...');
    for (const user of technicalUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (email, password, name, user_type, country, university, bio)
           VALUES (?, ?, ?, 'technical', ?, ?, ?)`,
          [user.email, hashedPassword, user.name, user.country, user.university, user.bio],
          function(err) {
            if (err) {
              reject(err);
              return;
            }

            const userId = this.lastID;
            console.log(`  ✓ Created ${user.name} (ID: ${userId})`);

            // Create technical profile
            db.run(
              'INSERT INTO technical_profiles (user_id, skills, github_url, portfolio_url) VALUES (?, ?, ?, ?)',
              [userId, user.skills, user.githubUrl || '', user.portfolioUrl || '']
            );

            // Add projects
            if (user.projects) {
              user.projects.forEach(project => {
                db.run(
                  'INSERT INTO previous_projects (user_id, title, description, tech_stack, project_url) VALUES (?, ?, ?, ?, ?)',
                  [userId, project.title, project.description, project.techStack, project.projectUrl || '']
                );
              });
            }

            resolve();
          }
        );
      });
    }

    console.log(`✅ Created ${technicalUsers.length} technical users`);

    // Seed non-technical users
    console.log('Creating non-technical users...');
    for (const user of nonTechnicalUsers) {
      const hashedPassword = await bcrypt.hash(user.password, 10);

      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (email, password, name, user_type, country, university, bio)
           VALUES (?, ?, ?, 'non-technical', ?, ?, ?)`,
          [user.email, hashedPassword, user.name, user.country, user.university, user.bio],
          function(err) {
            if (err) {
              reject(err);
              return;
            }

            const userId = this.lastID;
            console.log(`  ✓ Created ${user.name} (ID: ${userId})`);

            // Create non-technical profile
            db.run(
              'INSERT INTO non_technical_profiles (user_id, industry) VALUES (?, ?)',
              [userId, user.industry]
            );

            // Add project ideas
            if (user.ideas) {
              user.ideas.forEach(idea => {
                db.run(
                  `INSERT INTO project_ideas (user_id, title, description, timeline, equity_offering, payment_available, required_skills)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`,
                  [userId, idea.title, idea.description, idea.timeline, idea.equityOffering, idea.paymentAvailable ? 1 : 0, idea.requiredSkills]
                );
              });
            }

            resolve();
          }
        );
      });
    }

    console.log(`✅ Created ${nonTechnicalUsers.length} non-technical users`);
    console.log('\n🎉 Database seeding completed successfully!\n');
    console.log('📝 You can sign in with any of these accounts:');
    console.log('   Email: alex.chen@university.edu');
    console.log('   Email: david.b@harvard.edu');
    console.log('   Password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
