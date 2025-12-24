# LearnIT - AI-Powered Adaptive Learning Platform

A comprehensive MERN stack application delivering personalized learning experiences through AI-powered recommendations, gamification, interactive assessments, and collaborative learning features.

## 🎯 Overview

LearnIT is an intelligent adaptive learning platform that personalizes educational journeys based on user progress, skill levels, and learning goals. Powered by Google's Gemini AI and sophisticated recommendation algorithms, the platform offers dynamic lesson generation, skill tree visualization, interactive quizzes, community forums, and comprehensive progress tracking.

## ✨ Key Features

### Learning & Content
- **AI-Powered Content Generation**: Dynamic lesson creation using Google Gemini AI
- **Personalized Recommendations**: Intelligent algorithm suggests tailored learning paths
- **Skill Tree Visualization**: Interactive skill progression maps with personalized paths
- **Custom Learning Collections**: Create and organize personal learning directories
- **Interactive Quizzes**: Lesson-specific and assessment quizzes with instant feedback
- **Smart Notes System**: Take notes with bookmarking and organization features
- **AI ChatBot**: Context-aware learning assistant powered by Gemini

### Progress & Analytics
- **Comprehensive Progress Tracking**: Real-time monitoring across all topics
- **Activity Heatmap**: Visual representation of learning patterns
- **Weekly Activity Analytics**: Detailed insights into learning habits
- **Goal Management**: Set, track, and achieve learning objectives
- **Skill Mastery Levels**: Track proficiency across different topics
- **Certificate Generation**: Earn certificates upon course completion

### Gamification & Engagement
- **XP & Leveling System**: Earn experience points and level up
- **Daily Streak Tracking**: Build consistent learning habits
- **Badge System**: Unlock achievements for milestones
- **Leaderboard**: Compete with peers and track rankings
- **Points & Rewards**: Comprehensive gamification mechanics

### Community & Collaboration
- **Discussion Forum**: Category-based community discussions
- **Q&A Platform**: Ask questions, vote, and accept answers
- **Comment System**: Engage with posts and share knowledge
- **User Profiles**: View achievements and activity

### Admin & Management
- **User Management**: Create, suspend, and manage accounts
- **Role-Based Access Control**: Super Admin, Admin, Student roles
- **System Analytics**: Monitor platform health and usage
- **Bulk Operations**: Efficient batch user management
- **Content Management**: Organize courses and lessons

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS v4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Framer Motion** - Smooth animations and transitions
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Notification system
- **Lucide React** - Beautiful icon library

### Backend
- **Node.js & Express.js** - Server runtime and framework
- **MongoDB & Mongoose** - Database and ODM
- **JWT & bcryptjs** - Authentication and password hashing
- **Google Generative AI** - Gemini AI integration
- **CORS** - Cross-origin resource sharing

### AI Integration
- **Google Gemini 1.5 Flash** - Content generation and chat assistance
- **Custom Recommendation Engine** - Weighted scoring algorithm
- **Adaptive Learning Paths** - Dynamic content personalization

## 📚 User Roles & Permissions

### Super Admin
- **Full system control** - Cannot be suspended or deleted
- Create/manage both admin and student accounts
- Access all administrative features
- Manage lessons, courses, and content
- View comprehensive analytics

### Admin
- Create and manage student accounts
- Suspend/activate student accounts
- Manage lessons and courses
- View user progress and analytics
- **Cannot** create other admins or modify super admin

### Student
- Access personalized dashboard
- View recommended learning paths
- Complete lessons and track progress
- View personal analytics and skill mastery
- Rate and interact with content

## 🎓 Recommendation Engine

LearnIT uses a sophisticated weighted scoring algorithm to generate personalized recommendations:

### Algorithm Components

1. **Mastery Tracking** - Analyzes completed lessons to determine proficiency in each topic
2. **Gap Analysis** - Identifies knowledge gaps between current level and learning goals
3. **Prerequisite Validation** - Ensures recommended lessons align with current knowledge
4. **Multi-Factor Scoring**:
   - **Gap Relevance (50%)** - Addresses your learning needs
   - **Difficulty Match (20%)** - Appropriate for your skill level
   - **Popularity (15%)** - Community engagement metrics
   - **Rating (15%)** - User satisfaction scores

### Customization

Administrators can fine-tune the recommendation algorithm by adjusting weights in `backend/lib/recommendationEngine.js`:

```javascript
const WEIGHTS = {
  GAP_RELEVANCE: 0.5,
  DIFFICULTY_MATCH: 0.2,
  POPULARITY: 0.15,
  RATING: 0.15
};
```

## 🔌 API Endpoints Overview

### Authentication (`/api/auth`)
- Register, Login, Verify Token
- Profile Management, Password Change
- Password Reset with OTP

### Lessons (`/api/lessons`)
- Get All Lessons, Get Lesson by ID
- AI-Generated Personalized Lessons
- Custom Lesson CRUD Operations
- Learning Directory Management

### Progress (`/api/progress`)
- Track Lesson Progress & Completion
- Activity Heatmap & Weekly Stats
- Personal Learning Lists
- Collection Management

### Quizzes (`/api/quiz`)
- Assessment Quiz Generation
- Lesson-Specific Quizzes
- Quiz Submission & Scoring

### Recommendations (`/api/recommendations`)
- Personalized Learning Paths
- Refresh Recommendations

### Skill Trees (`/api/skill-tree`)
- Personalized Skill Tree Generation
- Default Skill Tree Templates
- Skill Tree History

### Goals (`/api/goals`)
- CRUD Operations for Learning Goals
- Goal Progress Tracking
- Goal Statistics

### Gamification (`/api/gamification`)
- XP & Level Stats
- Streak Management
- Leaderboard Rankings
- Badge System

### Forum (`/api/forum`)
- Posts & Comments CRUD
- Voting System
- Answer Acceptance
- Category Management

### Chat (`/api/chat`)
- AI ChatBot Interactions
- Session Management
- Chat History

### Certificates (`/api/certificates`)
- Generate Certificates
- View & Verify Certificates

### Notifications (`/api/notifications`)
- Real-time Notifications
- Read/Unread Management
- Notification Preferences

### Notes (`/api/notes`)
- Lesson Notes CRUD
- Bookmark Management

### Analytics (`/api/analytics`)
- Learning Patterns Analysis
- Performance Insights

### Admin (`/api/admin`)
- User Management (CRUD, Suspend, Bulk Actions)
- System Stats & Health
- Platform Analytics

**See [backend/README.md](backend/README.md) for detailed endpoint documentation.**

## 📁 Project Structure

```
LearnIT/
├── frontend/
│   ├── src/
│   │   ├── assets/              # Static assets and images
│   │   ├── components/          # Reusable UI components
│   │   │   ├── NavBar.jsx
│   │   │   ├── ChatBot.jsx
│   │   │   ├── XPBar.jsx
│   │   │   ├── StreakCounter.jsx
│   │   │   ├── BadgeDisplay.jsx
│   │   │   └── ...
│   │   ├── context/             # React Context providers
│   │   │   ├── AuthContext.jsx
│   │   │   └── GamificationContext.jsx
│   │   ├── lib/                 # API client and utilities
│   │   │   └── api.js
│   │   ├── pages/               # Route components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── LessonView.jsx
│   │   │   ├── SkillTreePage.jsx
│   │   │   ├── ForumPage.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── ...
│   │   ├── App.jsx              # Main app with routing
│   │   └── main.jsx             # React entry point
│   └── package.json
│
└── backend/
    ├── controllers/             # Request handlers
    │   ├── authController.js
    │   ├── lessonController.js
    │   ├── chatController.js
    │   ├── gamificationController.js
    │   └── ...
    ├── models/                  # MongoDB schemas
    │   ├── User.js
    │   ├── Lesson.js
    │   ├── Progress.js
    │   ├── SkillTree.js
    │   └── ...
    ├── routes/                  # API routes
    ├── middleware/              # Auth & validation
    │   └── auth.js
    ├── lib/                     # Core services
    │   ├── db.js
    │   ├── geminiService.js
    │   └── recommendationEngine.js
    ├── server.js                # Express server
    └── package.json
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Protected Routes** - Middleware-based authorization
- **Role-Based Access Control** - Super Admin, Admin, Student roles
- **Super Admin Protection** - Immutable first user with full privileges
- **Account Suspension** - Prevent login without data deletion
- **CORS Configuration** - Controlled cross-origin requests
- **Input Validation** - Sanitization and validation of user inputs

## 🎨 UI/UX Features

- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Modern UI** - TailwindCSS v4 with custom design system
- **Smooth Animations** - Framer Motion powered transitions
- **Loading States** - Clear feedback during async operations
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Real-time feedback for user actions
- **Interactive Components** - Engaging user interface elements

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ and npm
- MongoDB instance
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mjpriyanshu/LearnIT.git
cd LearnIT
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
```

Start backend:
```bash
npm run dev  # Development
npm start    # Production
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

Access the application at `http://localhost:5173`

### First User Setup
- First registered user automatically becomes Super Admin
- Super Admin can create additional admins and students

## 📖 Documentation

- **[Backend API Documentation](backend/README.md)** - Complete API reference
- **[Frontend Guide](frontend/README.md)** - Component and feature overview
- **[Dynamic Learning Guide](DYNAMIC_LEARNING.md)** - AI features documentation

## 🤝 Contributing

We welcome contributions! To contribute:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please ensure your code follows the existing style and includes appropriate tests.


## 📧 Contact & Support

- **GitHub**: [@mjpriyanshu](https://github.com/mjpriyanshu)
- **Issues**: [GitHub Issues](https://github.com/mjpriyanshu/Learnit/issues)

---

**Built with ❤️ using the MERN stack** | © 2025 LearnIT
