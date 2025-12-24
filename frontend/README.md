# LearnIT Frontend

Modern React 19 application for the LearnIT adaptive learning platform. Built with Vite, TailwindCSS v4, and Framer Motion for a responsive, engaging user experience.

## 🚀 Quick Start

### Requirements
- Node.js 16+
- npm or yarn

### Installation

```powershell
cd frontend
npm install
```

### Development

```powershell
npm run dev
```

Access at `http://localhost:5173`

### Build

```powershell
npm run build
npm run preview  # Preview production build
```

## 🛠️ Tech Stack

- **React 19** - UI library with latest features
- **Vite** - Lightning-fast build tool
- **TailwindCSS v4** - Utility-first CSS
- **React Router DOM** - Client-side routing
- **Framer Motion** - Smooth animations
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Icon library

## 📁 Project Structure

```
src/
├── assets/           # Static files and images
│   └── assets.js
├── components/       # Reusable UI components
│   ├── BadgeDisplay.jsx
│   ├── ChatBot.jsx
│   ├── Footer.jsx
│   ├── ImportLessonForm.jsx
│   ├── LessonQuiz.jsx
│   ├── NavBar.jsx
│   ├── NotesPanel.jsx
│   ├── NotificationPanel.jsx
│   ├── RecommendationPanel.jsx
│   ├── StreakCounter.jsx
│   └── XPBar.jsx
├── context/          # React Context providers
│   ├── AuthContext.jsx
│   └── GamificationContext.jsx
├── lib/              # Utilities and API
│   └── api.js
├── pages/            # Route pages
│   ├── AddContentPage.jsx
│   ├── AdminDashboard.jsx
│   ├── AdminSetup.jsx
│   ├── AdminUsersPage.jsx
│   ├── AnalyticsPage.jsx
│   ├── AssessmentPage.jsx
│   ├── AuthForm.jsx
│   ├── CertificatePage.jsx
│   ├── Dashboard.jsx
│   ├── ForumPage.jsx
│   ├── GoalsPage.jsx
│   ├── LandingPage.jsx
│   ├── LeaderboardPage.jsx
│   ├── LearningPathPage.jsx
│   ├── LessonView.jsx
│   ├── MessagesPage.jsx
│   ├── ProfilePage.jsx
│   ├── ProgressPage.jsx
│   └── SkillTreePage.jsx
├── App.jsx           # Main app with routing
├── main.jsx          # Entry point
├── App.css
└── index.css         # Global styles
```

## 🎨 Key Features

### Components

#### Navigation & Layout
- **NavBar** - Responsive navigation with role-based menu
- **Footer** - Footer with links and info

#### Learning & Progress
- **RecommendationPanel** - Personalized lesson suggestions
- **LessonQuiz** - Interactive quiz component
- **NotesPanel** - Note-taking interface
- **ImportLessonForm** - Import external content

#### Gamification
- **XPBar** - Experience points visualization
- **StreakCounter** - Daily streak tracker
- **BadgeDisplay** - Achievement badges

#### Communication
- **ChatBot** - AI-powered learning assistant
- **NotificationPanel** - Real-time notifications

### Pages

#### Public Pages
- **LandingPage** - Homepage for visitors
- **AuthForm** - Login/Register

#### Student Pages
- **Dashboard** - Personal learning dashboard
- **LessonView** - Lesson content viewer
- **LearningPathPage** - Personalized learning path
- **SkillTreePage** - Interactive skill tree
- **ProgressPage** - Progress tracking and analytics
- **GoalsPage** - Learning goals management
- **AnalyticsPage** - Personal analytics
- **AssessmentPage** - Skill assessments
- **ForumPage** - Community discussion
- **MessagesPage** - AI chat interface
- **CertificatePage** - View certificates
- **ProfilePage** - User profile management
- **LeaderboardPage** - Competition rankings

#### Admin Pages
- **AdminSetup** - Initial super admin setup
- **AdminDashboard** - Admin control panel
- **AdminUsersPage** - User management
- **AddContentPage** - Content management

### Context

#### AuthContext
- User authentication state
- Login/logout functions
- Token management
- User profile data

#### GamificationContext
- XP and level tracking
- Streak management
- Badge data
- Stats updates

### API Client (`lib/api.js`)

Axios instance with:
- Base URL configuration
- JWT token interceptor
- Error handling
- Request/response interceptors

## 🎯 Routing

```jsx
/ - Landing page
/login - Authentication
/register - User registration
/admin-setup - First user setup

/dashboard - Student dashboard
/lessons/:id - Lesson viewer
/learning-path - Personalized path
/skill-tree - Skill progression
/progress - Progress tracking
/goals - Learning goals
/analytics - Personal analytics
/assessment - Skill assessment
/forum - Discussion forum
/messages - AI chat
/certificates - Certificates
/profile - User profile
/leaderboard - Rankings

/admin - Admin dashboard
/admin/users - User management
/admin/content - Content management
```

## 🎨 Styling

### TailwindCSS v4
Custom configuration with:
- Custom color palette
- Responsive breakpoints
- Dark mode support (if implemented)
- Custom animations

### Framer Motion
Animations for:
- Page transitions
- Component mounting
- Interactive elements
- Smooth state changes

## 🔐 Authentication Flow

1. User logs in via `AuthForm`
2. Token stored in `localStorage`
3. `AuthContext` manages auth state
4. API client adds token to requests
5. Protected routes check auth status

## 🔔 Notifications

React Hot Toast for:
- Success messages
- Error alerts
- Info notifications
- Loading states

## 📱 Responsive Design

Breakpoints:
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

All pages and components fully responsive.

## 🎮 Gamification Features

- **XP System**: Earn points for activities
- **Levels**: Progress through levels
- **Streaks**: Daily learning streaks
- **Badges**: Achievement system
- **Leaderboard**: Competitive rankings

## 🤖 AI Integration

### ChatBot Component
- Conversational interface
- Context-aware responses
- Session management
- Chat history

### Recommendation System
- Personalized lesson suggestions
- Dynamic content updates
- Progress-based recommendations

## 🧩 Component Examples

### Using AuthContext
```jsx
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Using API Client
```jsx
import api from '../lib/api';

async function fetchLessons() {
  try {
    const response = await api.get('/lessons');
    return response.data;
  } catch (error) {
    console.error('Error fetching lessons:', error);
  }
}
```

### Using GamificationContext
```jsx
import { useGamification } from '../context/GamificationContext';

function XPComponent() {
  const { stats, refreshStats } = useGamification();
  
  return (
    <div>
      <p>XP: {stats.xp}</p>
      <p>Level: {stats.level}</p>
    </div>
  );
}
```

## 🔧 Configuration

### Vite Config (`vite.config.js`)
- React plugin with Fast Refresh
- Build optimization
- Dev server settings

### ESLint Config (`eslint.config.js`)
- React-specific rules
- Code quality standards

## 📦 Dependencies

### Core
- react: ^19.0.0
- react-dom: ^19.0.0
- react-router-dom: ^7.1.1

### Styling & Animation
- tailwindcss: ^4.0.0
- framer-motion: ^11.15.0

### Utilities
- axios: ^1.7.9
- react-hot-toast: ^2.4.1
- lucide-react: ^0.468.0

### Dev Dependencies
- @vitejs/plugin-react: ^4.3.4
- vite: ^6.0.5
- eslint: ^9.17.0

## 🚀 Deployment

### Build for Production
```powershell
npm run build
```

Output in `dist/` folder.

### Environment Variables
Create `.env` file:
```env
VITE_API_URL=http://localhost:5000
```

Access in code:
```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

## 🎯 Best Practices

- Use functional components with hooks
- Implement proper error boundaries
- Optimize with React.memo where needed
- Lazy load routes for better performance
- Keep components small and focused
- Use context for global state
- Implement loading states
- Handle errors gracefully

## 🧪 Development Tips

### Hot Module Replacement
Vite provides instant HMR for fast development.

### React DevTools
Use React DevTools browser extension for debugging.

### Performance
- Use React.memo for expensive components
- Implement virtualization for long lists
- Optimize images and assets
- Code splitting with React.lazy

## 📝 Code Style

- Use ES6+ features
- Functional components over class components
- Destructure props and state
- Use meaningful variable names
- Comment complex logic
- Keep files under 300 lines

## 🤝 Contributing

1. Follow existing code structure
2. Use TailwindCSS for styling
3. Ensure responsive design
4. Add proper error handling
5. Test on multiple devices
6. Update documentation
