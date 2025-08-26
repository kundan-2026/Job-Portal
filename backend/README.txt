Job Portal - Fullstack (Ready-to-run)
=====================================

What's inside
- backend/: Node.js + Express + MongoDB (mongoose) API with auth (JWT), jobs, tracker
- frontend/: Static frontend (HTML/CSS/JS) that calls the backend APIs

Quick start (development)
1. Make sure Node.js and npm are installed.
2. Make sure MongoDB is running locally OR use a MongoDB Atlas URI.
   - If local MongoDB, default is mongodb://127.0.0.1:27017/jobportal
3. Copy backend/.env.example to backend/.env and set values (JWT_SECRET, MONGODB_URI)
4. In terminal:
   cd backend
   npm install
   npm run dev
5. Open browser at http://localhost:5000

Notes
- Signup creates candidate or recruiter accounts. Recruiters can post jobs.
- The frontend stores the JWT in localStorage after login and uses it for protected requests.
- For production, add HTTPS, stronger validation, rate-limiting, and don't store JWTs in localStorage if XSS is a concern.
