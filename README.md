# A2Z Learning Platform

A simple roadmap management website similar to Striver's A2Z DSA Course Sheet. Built with HTML, CSS, JavaScript, Express.js, and MySQL.

## 🎯 Features

### User Features
- **Browse Roadmaps**: View structured learning paths with step-by-step modules
- **Track Progress**: Mark tasks as completed and see progress bars
- **Filter Content**: Filter roadmaps by difficulty level
- **Progress Dashboard**: View overall learning statistics
- **Profile Management**: Update personal information and change password

### Admin Features
- **Create Roadmaps**: Add new learning paths with modules and tasks
- **Manage Content**: View and delete existing roadmaps
- **Dashboard**: Monitor platform statistics

## 🚀 Quick Start

### Demo Accounts
- **Admin**: `admin@test.com` / `admin123`
- **User**: `user@test.com` / `user123`

### Installation
1. Install dependencies: `npm install`
2. Start server: `npm run dev`
3. Visit: `http://localhost:3001`

## 📱 Pages Structure

### Public Pages
- **Home** (`/`) - Landing page with sample roadmap preview
- **Login** (`/login`) - User authentication
- **Register** (`/register`) - Account creation

### User Pages
- **Dashboard** (`/dashboard`) - Browse available roadmaps
- **Roadmap View** (`/roadmap/:id`) - Interactive A2Z format display
- **Progress** (`/progress`) - Track learning statistics
- **Profile** (`/profile`) - Manage account settings

### Admin Pages
- **Admin Dashboard** (`/admin`) - Create and manage roadmaps

## 🎨 Design Features

- **A2Z Format**: Step-by-step module layout similar to Striver's course
- **Clean UI**: Simple, beginner-friendly design
- **Responsive**: Works on desktop and mobile devices
- **Progress Tracking**: Visual progress bars and completion percentages
- **Interactive Tasks**: Checkbox-based task completion

## 📊 Sample Roadmap

The platform includes a pre-loaded "DSA Beginner Roadmap" with:

- **Step 1: Learn the basics**
  - Things to Know in Programming Languages
  - Build-up Logical Thinking
  - Time and Space Complexities

- **Step 2: Learn Important Sorting Techniques**
  - Selection Sort, Bubble Sort, Insertion Sort
  - Merge Sort, Quick Sort

- **Step 3: Solve Problems on Arrays**
  - Largest Element, Second Largest Element
  - Check if array is sorted
  - Remove duplicates, Array rotation

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Express.js (Node.js)
- **Database**: In-memory storage (easily replaceable with MySQL)
- **Authentication**: bcryptjs with express-session
- **Styling**: Custom CSS with responsive design

## 📝 Code Structure

```
├── server.js          # Express server with API routes
├── public/
│   ├── style.css      # Main stylesheet
│   ├── index.html     # Landing page
│   ├── login.html     # Login page
│   ├── register.html  # Registration page
│   ├── dashboard.html # User dashboard
│   ├── roadmap.html   # Roadmap viewer (A2Z format)
│   ├── progress.html  # Progress tracking
│   ├── profile.html   # User profile
│   └── admin.html     # Admin panel
└── package.json       # Dependencies
```

## 🔧 API Endpoints

### Authentication
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `POST /api/logout` - User logout
- `GET /api/user` - Get current user info

### Roadmaps
- `GET /api/roadmaps` - Get all roadmaps
- `GET /api/roadmap/:id` - Get specific roadmap
- `POST /api/roadmaps` - Create new roadmap (admin only)

### Progress
- `GET /api/progress/:roadmapId` - Get user progress for roadmap
- `POST /api/progress` - Update task completion

## 💾 Data Structure

### Roadmap Structure
```javascript
{
  id: 1,
  title: "DSA Beginner Roadmap",
  difficulty: "Beginner",
  duration: "60 days",
  modules: [
    {
      id: 1,
      title: "Step 1: Learn the basics",
      tasks: [
        {
          id: 1,
          title: "Things to Know in Programming",
          type: "Theory",
          link: "#"
        }
      ]
    }
  ]
}
```

### Progress Structure
```javascript
userProgress = {
  userId: {
    roadmapId: [completedTaskIds]
  }
}
```

## 🎓 Learning Path Format

Following Striver's A2Z DSA Course structure:
- **Modules** are organized as "Steps" (Step 1, Step 2, etc.)
- **Tasks** include Theory, Problems, and Practice exercises
- **Progress** is tracked per individual task
- **Visual indicators** show completion status

## 🔒 Security Features

- Password hashing with bcryptjs
- Session-based authentication
- Role-based access control (admin/user)
- Input validation on forms
- Protected API routes

## 📱 Responsive Design

- Mobile-first CSS approach
- Flexible grid layouts
- Touch-friendly interactive elements
- Optimized for all screen sizes

---

**Built for structured learning with simplicity and effectiveness in mind!** 🚀
