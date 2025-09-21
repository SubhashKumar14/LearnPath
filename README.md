# LearnHub - Learning Management Platform

A lightweight (under ~1500 LOC) learning management platform built with Node.js, Express, MySQL, vanilla JS (SPA) + Bootstrap 5. Features authentication, course browsing, hierarchical content (courses → modules → tasks), real-time progress tracking, certificates, analytics dashboard, and responsive UI.

## Features
- JWT authentication (register/login/profile)
- Courses with modules & tasks (video, reading, quiz, assignment)
- Enrollment & progress persistence (task checkboxes)
- Automatic course progress % + completion timestamp
- Certificate generation on 100% completion
- My Progress dashboard (stats + enrolled courses)
- User profile & achievements placeholder
- Responsive Bootstrap 5 UI with gradients & animations

## Stack
Backend: Node.js + Express + MySQL (mysql2/promise)
Auth: JWT + bcryptjs
Frontend: Vanilla JavaScript SPA + Bootstrap 5
Security: Parameterized queries, hashed passwords, JWT expiry 24h, CORS enabled

## Project Structure
```
learning-platform/
  server.js
  package.json
  .env.example
  config/ (database + auth helpers)
  middleware/ (auth JWT middleware)
  routes/ (auth, courses, progress APIs)
  database/schema.sql (tables + seed data)
  public/ (index.html, css, js)
```

## Environment Variables (.env)
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=learning_platform
JWT_SECRET=replace_with_long_random_secret
NODE_ENV=development
```

## Install & Run
```powershell
# Install dependencies
npm install

# Create DB & seed data
# Adjust MySQL credentials first in .env then:
mysql -u root -p < database/schema.sql

# Start server
npm start
# Visit http://localhost:3000
```

## API Endpoints
Auth
- POST /api/auth/register  { username,email,password }
- POST /api/auth/login     { email,password }
- GET  /api/auth/profile   (Bearer token)

Courses
- GET  /api/courses
- GET  /api/courses/:id              (includes modules, tasks, completion flags when authenticated)
- POST /api/courses/:id/enroll       (auth)
- POST /api/courses/:id/certificate  (auth, requires 100% progress)

Progress
- POST /api/progress/task  { taskId, completed } (auth)
- GET  /api/progress/my-progress (auth)

Health
- GET /api/health

## Data Model
Tables: users, courses, modules, tasks, user_courses, user_progress, certificates. See `database/schema.sql` for full DDL and sample seed data.

## Certificates
When a course reaches 100% progress (all tasks completed) a user can generate a certificate. A unique `CERT-<timestamp>-<id>` is stored with user + course metadata.

## Security Notes
- Passwords hashed with bcrypt (12 rounds)
- JWT expires in 24h; store only token in localStorage
- Parameterized queries avoid SQL injection
- Limit exposed fields in responses (no password)
- Ensure strong `JWT_SECRET` in production
- Consider HTTPS + secure cookies for production hardening (not included here for brevity)

## Extending
Ideas:
- Add admin role & CRUD for courses/modules/tasks
- Add quizzes & scoring
- Add PDF certificate rendering
- Add rate limiting & helmet middleware
- Add pagination & search for courses

## Line Count Constraint
All source kept intentionally concise; avoid unnecessary abstractions while retaining readability and separation of concerns.

## License
MIT
