# Backend — Learning Path Recommendation (starter)

Requirements: Node 16+ and npm

Install and run (PowerShell):

```powershell
cd backend; npm install
# start in development (requires nodemon)
npm run dev
# or run production
npm start
```

The API exposes:
- `GET /api/health` — health check
- `GET /api/recommendations` — sample recommendations (query param `userId` optional)

Add a `.env` file (copy from `.env.example`) and put your `MONGO_URI` there.
