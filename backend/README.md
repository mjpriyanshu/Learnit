# LearnIT Backend API

RESTful API for the LearnIT adaptive learning platform, built with Node.js, Express, and MongoDB. Features AI-powered content generation, intelligent recommendations, and comprehensive learning management.

## 🚀 Quick Start

### Requirements
- Node.js 16+
- MongoDB
- Google Gemini API key

### Installation

```powershell
cd backend
npm install
```

### Configuration

Create `.env` file:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
GEMINI_API_KEY=your_google_gemini_api_key
```

### Running

```powershell
# Development (requires nodemon)
npm run dev

# Production
npm start
```

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/check-first-user` | Check if first user exists | No |
| POST | `/register` | Register new account | No |
| POST | `/login` | User login | No |
| GET | `/verify` | Verify JWT token | Yes |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update profile | Yes |
| POST | `/change-password` | Change password | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/verify-otp` | Verify OTP code | No |
| POST | `/reset-password` | Reset password with OTP | No |

### Lesson Routes (`/api/lessons`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all lessons | Yes |
| GET | `/:id` | Get lesson by ID | Yes |
| GET | `/my/directory` | Get personal learning directory | Yes |
| GET | `/my/custom` | Get custom lessons | Yes |
| POST | `/custom` | Create custom lesson | Yes |
| PUT | `/custom/:id` | Update custom lesson | Yes |
| DELETE | `/custom/:id` | Delete custom lesson | Yes |
| POST | `/generate/personalized` | Generate AI personalized lessons | Yes |
| POST | `/generate/topic` | Generate lessons for specific topic | Yes |
| POST | `/refresh` | Refresh lesson recommendations | Yes |

### Progress Routes (`/api/progress`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/` | Create/update progress | Yes |
| GET | `/` | Get progress summary | Yes |
| GET | `/detailed` | Get detailed progress with mastery | Yes |
| GET | `/in-progress` | Get in-progress lessons | Yes |
| GET | `/user/:id` | Get user progress by ID | Yes |
| POST | `/add-to-list` | Add lesson to learning list | Yes |
| POST | `/remove-from-list` | Remove from learning list | Yes |
| GET | `/my-list` | Get personal learning list | Yes |
| POST | `/move-to-collection` | Move lesson to collection | Yes |
| GET | `/activity-heatmap` | Get activity heatmap data | Yes |
| GET | `/weekly-activity` | Get weekly activity stats | Yes |

### Quiz Routes (`/api/quiz`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/assessment` | Get assessment quiz | Yes |
| POST | `/assessment/submit` | Submit assessment | Yes |
| GET | `/lesson/:lessonId` | Get lesson quiz | Yes |
| POST | `/lesson/:lessonId/submit` | Submit lesson quiz | Yes |

### Recommendation Routes (`/api/recommendations`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get personalized recommendations | Yes |
| POST | `/refresh` | Refresh recommendation path | Yes |

### Skill Tree Routes (`/api/skill-tree`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/personalized` | Generate personalized skill tree | Yes |
| GET | `/default` | Get default skill tree | Yes |
| GET | `/history` | Get skill tree history | Yes |

### Goal Routes (`/api/goals`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all goals | Yes |
| GET | `/stats` | Get goal statistics | Yes |
| POST | `/` | Create new goal | Yes |
| PUT | `/:goalId` | Update goal | Yes |
| PATCH | `/:goalId/progress` | Update goal progress | Yes |
| DELETE | `/:goalId` | Delete goal | Yes |

### Gamification Routes (`/api/gamification`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stats` | Get user stats (XP, level, streak) | Yes |
| POST | `/update-streak` | Update daily streak | Yes |
| POST | `/lesson-complete` | Record lesson completion | Yes |
| GET | `/leaderboard` | Get leaderboard rankings | Yes |
| GET | `/badges` | Get all badges | Yes |

### Forum Routes (`/api/forum`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/categories` | Get forum categories | Yes |
| GET | `/posts` | Get all posts (with filters) | Yes |
| GET | `/posts/:postId` | Get post by ID | Yes |
| POST | `/posts` | Create new post | Yes |
| PUT | `/posts/:postId` | Update post | Yes |
| DELETE | `/posts/:postId` | Delete post | Yes |
| POST | `/posts/:postId/vote` | Vote on post | Yes |
| PATCH | `/posts/:postId/resolve` | Mark post as resolved | Yes |
| POST | `/posts/:postId/comments` | Add comment to post | Yes |
| POST | `/comments/:commentId/vote` | Vote on comment | Yes |
| POST | `/posts/:postId/comments/:commentId/accept` | Accept answer | Yes |
| DELETE | `/comments/:commentId` | Delete comment | Yes |

### Chat Routes (`/api/chat`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/message` | Send message to AI chatbot | Yes |
| GET | `/sessions` | Get chat sessions | Yes |
| GET | `/sessions/:sessionId` | Get chat history | Yes |
| DELETE | `/sessions/:sessionId` | Delete chat session | Yes |

### Certificate Routes (`/api/certificates`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/generate` | Generate certificate | Yes |
| GET | `/my-certificates` | Get user certificates | Yes |
| GET | `/:id` | Get certificate by ID | Yes |
| GET | `/verify/:id` | Verify certificate (public) | No |

### Notification Routes (`/api/notifications`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all notifications | Yes |
| GET | `/unread-count` | Get unread count | Yes |
| GET | `/preferences` | Get notification preferences | Yes |
| PATCH | `/:notificationId/read` | Mark notification as read | Yes |
| PATCH | `/read-all` | Mark all as read | Yes |
| DELETE | `/:notificationId` | Delete notification | Yes |
| DELETE | `/` | Clear all notifications | Yes |
| POST | `/create` | Create notification | Yes |

### Note Routes (`/api/notes`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all notes | Yes |
| GET | `/lesson/:lessonId` | Get notes for lesson | Yes |
| POST | `/lesson/:lessonId` | Save note for lesson | Yes |
| PATCH | `/lesson/:lessonId/bookmark` | Toggle bookmark | Yes |
| DELETE | `/lesson/:lessonId` | Delete note | Yes |

### Analytics Routes (`/api/analytics`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get analytics data | Yes |
| GET | `/patterns` | Get learning patterns | Yes |
| GET | `/recommendations` | Get analytics recommendations | Yes |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stats` | Get system statistics | Admin |
| GET | `/health` | Get system health | Admin |
| GET | `/analytics` | Get detailed analytics | Admin |
| POST | `/cache/flush` | Flush cache | Admin |
| GET | `/users` | Get all users | Admin |
| GET | `/users/:id` | Get user by ID | Admin |
| POST | `/users` | Create new user | Admin |
| POST | `/users/bulk` | Bulk user actions | Admin |
| PATCH | `/users/:id/suspend` | Suspend/activate user | Admin |
| DELETE | `/users/:id` | Delete user | Admin |

### Course Routes (`/api/courses`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/` | Get all courses | Yes |

### Track Routes (`/api/track`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/visit` | Track page visit | Yes |

## 🤖 AI Features

### Gemini Integration
- **Content Generation**: Dynamic lesson creation
- **ChatBot**: Context-aware learning assistant
- **Personalization**: Adaptive learning paths

### Recommendation Engine
Weighted scoring algorithm considering:
- Gap Relevance (50%)
- Difficulty Match (20%)
- Popularity (15%)
- Rating (15%)

## 🔐 Authentication

### JWT Authentication
- Token-based authentication
- Middleware: `authMiddleware`, `protect`
- Token expiration: Configurable

### User Roles
- **Super Admin**: Full system access (first user)
- **Admin**: User and content management
- **Student**: Learning access

## 📦 Models

- **User** - User accounts and authentication
- **Lesson** - Learning content
- **Course** - Course structure
- **Progress** - User progress tracking
- **Quiz** - Assessments and quizzes
- **SkillTree** - Skill progression
- **Goal** - Learning goals
- **Certificate** - Completion certificates
- **ChatHistory** - AI chat sessions
- **Post** - Forum posts
- **Comment** - Forum comments
- **Note** - User notes
- **Notification** - System notifications
- **UserStats** - Gamification stats
- **RecommendationLog** - Recommendation history

## 🔧 Services

### Gemini Service (`lib/geminiService.js`)
AI-powered content generation and chat

### Recommendation Engine (`lib/recommendationEngine.js`)
Intelligent learning path suggestions

### Database (`lib/db.js`)
MongoDB connection management

## 🛡️ Middleware

### Authentication (`middleware/auth.js`)
- `authMiddleware` - Standard authentication
- `protect` - Protected route guard
- Role-based access control

## 📝 Environment Variables

```env
# Database
MONGO_URI=mongodb://localhost:27017/learnit

# Authentication
JWT_SECRET=your_secret_key_here

# Server
PORT=5000

# AI
GEMINI_API_KEY=your_google_gemini_api_key
```

## 🧪 API Testing

Use tools like Postman or Thunder Client to test endpoints.

### Sample Request (Login)
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Sample Response
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "123",
    "name": "John Doe",
    "role": "student"
  }
}
```

## 🚨 Error Handling

All endpoints return consistent error format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info"
}
```

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": {...}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message"
}
```
