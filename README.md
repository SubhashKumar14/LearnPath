# 🗺️ RoadmapLearn - Learning Path Management Platform

A comprehensive roadmap management website where administrators can create structured learning paths and users can follow them to track their progress.

## 🎯 Project Overview

**RoadmapLearn** is a web-based platform designed to facilitate structured learning through expertly crafted roadmaps. The platform supports two main user roles:

- **Administrators**: Create, manage, and organize learning roadmaps with modules and tasks
- **Users**: Browse, follow, and track progress through available roadmaps

## ✨ Core Features

### 👨‍���� Admin Features
- **Admin Dashboard**: Overview of platform statistics and recent activity
- **Roadmap Creation**: Interactive form to create roadmaps with modules and tasks
- **Roadmap Management**: View, edit, delete, and manage all roadmaps
- **Bulk Operations**: Publish, unpublish, or delete multiple roadmaps
- **Export/Import**: Backup and restore roadmap data
- **User Management**: Monitor platform activity and user engagement

### 👥 User Features
- **User Dashboard**: Browse available roadmaps with filtering options
- **Roadmap View**: Interactive roadmap display in Striver A2Z format
- **Progress Tracking**: Mark tasks as completed and track learning progress
- **Progress Analytics**: Visual progress indicators and completion statistics
- **Activity Calendar**: GitHub-style contribution calendar (coming soon)
- **Profile Management**: Update personal information and preferences

### 🔐 Authentication System
- **Secure Registration/Login**: User account creation and authentication
- **Role-based Access**: Different interfaces for admins and users
- **Session Management**: Secure session handling and logout
- **Demo Accounts**: Pre-configured admin and user accounts for testing

## 🛠️ Technical Architecture

### Frontend
- **HTML5**: Semantic markup with modern web standards
- **CSS3**: Custom styling with responsive design and CSS Grid/Flexbox
- **Vanilla JavaScript**: Interactive functionality without framework dependencies
- **Responsive Design**: Mobile-first approach with breakpoints for all devices

### Backend
- **Node.js**: Server-side JavaScript runtime
- **Express.js**: Web application framework for routing and middleware
- **MySQL**: Primary database (with in-memory fallback for demo)
- **bcryptjs**: Password hashing and security
- **express-session**: Session management
- **CORS**: Cross-origin resource sharing support

### Data Structure
```
Roadmaps
├── Basic Info (title, difficulty, duration, description)
├── Modules
│   ├── Module Info (title, description)
│   └── Tasks
│       └── Task Info (title, description, type)
└── Progress Tracking (user_id, roadmap_id, module_id, task_id, completed)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager
- MySQL (optional - will use in-memory storage if not available)

### Installation

1. **Clone the repository** (or start from the current project)
```bash
git clone <repository-url>
cd roadmap-management-website
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - The application will automatically fall back to in-memory storage if MySQL is not configured

### Demo Accounts

The application includes demo accounts for quick testing:

**Admin Account:**
- Email: `admin@roadmaplearn.com`
- Password: `admin123`

**User Account:**
- Email: `user@roadmaplearn.com`
- Password: `user123`

## 📱 User Interface Overview

### 🏠 Landing Page
- Welcome message and platform introduction
- Sample roadmaps preview
- Registration and login options
- Feature highlights and benefits

### 👨‍💼 Admin Interface
- **Admin Dashboard**: Platform statistics and quick actions
- **Add Roadmap**: Dynamic form with module and task management
- **Manage Roadmaps**: Table view with filtering, sorting, and bulk operations
- **Real-time Preview**: Instant roadmap preview during creation

### 👥 User Interface
- **User Dashboard**: Roadmap browsing with filters and search
- **Roadmap View**: Interactive modules with expandable task lists
- **Progress Page**: Comprehensive progress tracking and analytics
- **Profile Page**: Personal information and learning preferences

## 🎨 Design Features

### Visual Design
- **Modern UI**: Clean, professional interface with consistent styling
- **Color Scheme**: Purple gradient theme with accessibility considerations
- **Typography**: Clear, readable fonts with proper hierarchy
- **Icons**: Emoji-based icons for universal recognition
- **Animations**: Smooth transitions and hover effects

### User Experience
- **Intuitive Navigation**: Clear menu structure and breadcrumbs
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Loading States**: Visual feedback during data loading
- **Error Handling**: User-friendly error messages and recovery options
- **Progress Indicators**: Visual progress bars and completion percentages

## 🔧 Configuration

### Environment Variables
```bash
# Database Configuration (optional)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=roadmap_db

# Security
JWT_SECRET=your_secret_key

# Server Configuration
PORT=3000
```

### Database Setup (Optional)
If you want to use MySQL instead of in-memory storage:

1. Create a MySQL database named `roadmap_db`
2. Set the environment variables above
3. The application will automatically create the necessary tables

## 📊 Sample Data

The application includes rich sample data:

### Sample Roadmaps
1. **Data Structures & Algorithms** (Beginner, 60 days)
   - Arrays and Strings
   - Linked Lists
   - Stacks and Queues

2. **Full Stack Web Development** (Intermediate, 90 days)
   - Frontend Fundamentals
   - React Development

3. **Machine Learning Basics** (Advanced, 120 days)
   - Python for ML

Each roadmap includes detailed tasks with descriptions and learning objectives.

## 🛡️ Security Features

- **Password Hashing**: Secure bcrypt password storage
- **Session Security**: HTTP-only session cookies
- **Input Validation**: Client and server-side validation
- **SQL Injection Protection**: Parameterized queries (when using database)
- **XSS Protection**: Input sanitization and output encoding
- **Role-based Access Control**: Admin vs user permissions

## 📈 Future Enhancements

### Planned Features
- **Real Database Integration**: Full MySQL schema implementation
- **User Management**: Admin interface for user moderation
- **Advanced Analytics**: Detailed learning analytics and reports
- **Notification System**: Email and in-app notifications
- **Discussion Forums**: Community features and peer interaction
- **Content Management**: Rich text editor for roadmap content
- **API Integration**: RESTful API for mobile app development

### Potential Integrations
- **External Learning Platforms**: Link to Coursera, Udemy, etc.
- **Code Execution**: Integrated coding environment
- **Video Streaming**: Embedded video content
- **Assessment Tools**: Quizzes and certification system
- **Social Features**: User profiles and achievement sharing

## 🤝 Contributing

This project follows standard web development practices:

1. **Code Style**: Consistent formatting and naming conventions
2. **Documentation**: Clear comments and documentation
3. **Testing**: Comprehensive testing for all features
4. **Security**: Regular security audits and updates

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation above
- Review the sample implementations
- Test with the provided demo accounts
- Examine the code structure and comments

## 🎉 Acknowledgments

Built with modern web technologies and best practices for educational content management. Special thanks to the open-source community for the tools and libraries that made this project possible.

---

**Happy Learning! 🚀**

> This platform is designed to make structured learning accessible and engaging for everyone. Whether you're an educator creating content or a learner following a path, RoadmapLearn provides the tools you need to succeed.
