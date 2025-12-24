# LearnIT - Dynamic Learning Path Recommendation System

A modern MERN stack application that delivers personalized learning experiences through intelligent recommendation algorithms, role-based access control, and comprehensive progress tracking.

## 🎯 Overview

LearnIT is an adaptive learning platform designed to provide customized educational paths based on individual user progress, skill levels, and learning goals. The system leverages a sophisticated recommendation engine that analyzes user behavior and performance to suggest the most relevant learning resources.

## ✨ Key Features

### For Students
- **Intelligent Recommendations**: AI-powered algorithm suggests lessons tailored to your learning journey
- **Progress Tracking**: Real-time monitoring of skill mastery across multiple topics
- **Interactive Dashboard**: Visualize your learning progress with intuitive metrics
- **External Resource Integration**: Access curated content from YouTube, articles, and official documentation
- **Personalized Learning Paths**: Dynamic course recommendations based on your goals and current skill level

### For Administrators
- **User Management**: Create, suspend, and manage student and admin accounts
- **Role-Based Access Control**: Three-tier system (Super Admin, Admin, Student)
- **Content Management**: Organize lessons, courses, and learning materials
- **Analytics Dashboard**: Monitor platform usage and student progress
- **Protected Super Admin**: Immutable super administrator

### Technical Highlights
- **Responsive Design**: Mobile-first UI built with TailwindCSS v4
- **Real-time Notifications**: Instant feedback with React Hot Toast
- **Secure Authentication**: JWT-based authentication with bcrypt password hashing
- **Smooth Animations**: Enhanced UX with Framer Motion
- **RESTful API**: Well-structured backend with Express.js

## 🛠️ Technology Stack

### Frontend
- **React 19** - Modern React with latest features
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS v4** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Framer Motion** - Animation library
- **Axios** - HTTP client with interceptors
- **React Hot Toast** - Notification system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing

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

## 🔌 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new account | No |
| POST | `/api/auth/login` | User login | No |
| GET | `/api/auth/verify` | Verify JWT token | Yes |

### Recommendation Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/recommendations` | Get personalized recommendations | Yes |
| POST | `/api/recommendations/refresh` | Regenerate recommendation path | Yes |

### Progress Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/progress` | Update lesson progress | Yes |
| GET | `/api/progress` | Get user progress summary | Yes |
| GET | `/api/progress/detailed` | Get detailed progress with mastery | Yes |

### Lesson & Course Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/lessons` | List all lessons | Yes |
| GET | `/api/lessons/:id` | Get specific lesson | Yes |
| GET | `/api/courses` | List all courses | Yes |

### Admin Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/users` | List all users | Admin |
| POST | `/api/admin/users` | Create new user | Admin |
| PATCH | `/api/admin/users/:id/suspend` | Suspend/activate user | Admin |
| DELETE | `/api/admin/users/:id` | Delete user | Admin |

## 📁 Project Structure

```
LearnIT/
├── frontend/
│   ├── src/
│   │   ├── assets/              # Images, icons, and static files
│   │   ├── components/          # Reusable UI components
│   │   │   ├── NavBar.jsx
│   │   │   ├── Footer.jsx
│   │   │   └── RecommendationPanel.jsx
│   │   ├── context/             # React Context (Auth, etc.)
│   │   │   └── AuthContext.jsx
│   │   ├── lib/                 # Utilities and API client
│   │   │   └── api.js
│   │   ├── pages/               # Page-level components
│   │   │   ├── AuthForm.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── AdminUsersPage.jsx
│   │   │   ├── LessonView.jsx
│   │   │   └── ProgressPage.jsx
│   │   ├── App.jsx              # Main app with routing
│   │   ├── main.jsx             # React entry point
│   │   └── index.css            # Global styles
│   ├── package.json
│   └── vite.config.js
│
└── backend/
    ├── controllers/             # Request handlers
    │   ├── authController.js
    │   ├── adminController.js
    │   ├── recommendationController.js
    │   ├── progressController.js
    │   └── lessonController.js
    ├── models/                  # MongoDB schemas
    │   ├── User.js
    │   ├── Lesson.js
    │   ├── Course.js
    │   ├── Progress.js
    │   └── RecommendationLog.js
    ├── routes/                  # API routes
    ├── middleware/              # Authentication & validation
    │   └── auth.js
    ├── lib/                     # Core utilities
    │   ├── db.js
    │   └── recommendationEngine.js
    ├── server.js                # Express server
    └── package.json
```

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with salt rounds
- **Protected Routes** - Middleware-based authorization
- **Role-Based Access Control** - Three-tier permission system
- **Super Admin Protection** - Immutable first user with full privileges
- **Account Suspension** - Prevent login without data deletion
- **CORS Configuration** - Controlled cross-origin requests

## 🎨 UI/UX Features

- **Responsive Design** - Mobile, tablet, and desktop optimized
- **Dark Mode Support** - Comfortable viewing in any lighting
- **Smooth Animations** - Framer Motion powered transitions
- **Loading States** - Clear feedback during async operations
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Real-time feedback for user actions

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
