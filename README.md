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

### Reseeding After Seed Changes
If you update `database/schema.sql` (e.g. added more modules/tasks or changed course images):
```powershell
mysql -u root -p -e "DROP DATABASE IF EXISTS learning_platform;";
mysql -u root -p < database/schema.sql
```
This will recreate all tables and insert the fresh extended seed data (5 modules * 3 tasks each per course).

### Course Logos
The sample courses now use technology logos:
- JavaScript: `public/images/js-logo.svg`
- React: `public/images/react-logo.svg`
- Node.js: `public/images/node-logo.svg`

These are referenced in seed data via `/images/<logo-file>` paths and served from the `public/images` directory.

> Disclaimer: Icons are simplified, newly generated vector representations created for educational/demo purposes and are **not** the official trademarks. React, Node.js and JavaScript remain property of their respective owners. Replace with your own branding for production use.

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

Certificates
- GET  /api/certificates/:certificateId (auth, owner only)

Health
- GET /api/health

## Data Model
Tables: users, courses, modules, tasks, user_courses, user_progress, certificates. See `database/schema.sql` for full DDL and sample seed data.

## Certificates
When a course reaches 100% progress (all tasks completed) a user can generate a certificate. A unique `CERT-<timestamp>-<id>` is stored with user + course metadata.

After generation the UI opens a new tab:
```
/certificate.html?id=<CERTIFICATE_ID>
```
That page fetches the certificate details (auth required) and allows PDF download via html2pdf (falls back to print if library fails). You can also supply URL params manually for quick previews: `?student=Name&course=Course+Title&id=TEST-ID`.

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
