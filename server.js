const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'roadmap-secret',
  resave: false,
  saveUninitialized: false
}));

// Simple in-memory storage (for demo - replace with MySQL in production)
let users = [
  { id: 1, email: 'admin@test.com', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', name: 'Admin', role: 'admin' }, // password: admin123
  { id: 2, email: 'user@test.com', password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', name: 'Test User', role: 'user' } // password: user123
];

let roadmaps = [
  {
    id: 1,
    title: 'DSA Beginner Roadmap',
    difficulty: 'Beginner',
    duration: '60 days',
    modules: [
      {
        id: 1,
        title: 'Step 1: Learn the basics',
        tasks: [
          { id: 1, title: 'Things to Know in C++/Java/Python or any language', type: 'Theory', link: '#' },
          { id: 2, title: 'Build-up Logical Thinking', type: 'Theory', link: '#' },
          { id: 3, title: 'Learn about Time and Space Complexities', type: 'Theory', link: '#' }
        ]
      },
      {
        id: 2,
        title: 'Step 2: Learn Important Sorting Techniques',
        tasks: [
          { id: 4, title: 'Selection Sort', type: 'Problem', link: '#' },
          { id: 5, title: 'Bubble Sort', type: 'Problem', link: '#' },
          { id: 6, title: 'Insertion Sort', type: 'Problem', link: '#' },
          { id: 7, title: 'Merge Sort', type: 'Problem', link: '#' },
          { id: 8, title: 'Quick Sort', type: 'Problem', link: '#' }
        ]
      },
      {
        id: 3,
        title: 'Step 3: Solve Problems on Arrays',
        tasks: [
          { id: 9, title: 'Largest Element in Array', type: 'Problem', link: '#' },
          { id: 10, title: 'Second Largest Element in Array', type: 'Problem', link: '#' },
          { id: 11, title: 'Check if array is sorted', type: 'Problem', link: '#' },
          { id: 12, title: 'Remove duplicates from Sorted array', type: 'Problem', link: '#' },
          { id: 13, title: 'Left rotate an array by one place', type: 'Problem', link: '#' }
        ]
      }
    ]
  }
];

let userProgress = {}; // { userId: { roadmapId: [completedTaskIds] } }

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Authentication
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  
  if (user && await bcrypt.compare(password, user.password)) {
    req.session.userId = user.id;
    req.session.userRole = user.role;
    
    if (user.role === 'admin') {
      res.json({ redirect: '/admin' });
    } else {
      res.json({ redirect: '/dashboard' });
    }
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password: hashedPassword,
    role: 'user'
  };
  
  users.push(newUser);
  res.json({ message: 'User created successfully' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out' });
});

// Protected routes
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.session.userRole !== 'admin') {
    return res.status(403).send('Admin access required');
  }
  next();
};

app.get('/dashboard', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/roadmap/:id', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'roadmap.html'));
});

app.get('/progress', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'progress.html'));
});

app.get('/profile', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.get('/admin', requireAuth, requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// API endpoints
app.get('/api/user', requireAuth, (req, res) => {
  const user = users.find(u => u.id === req.session.userId);
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
});

app.get('/api/roadmaps', (req, res) => {
  res.json(roadmaps);
});

app.get('/api/roadmap/:id', (req, res) => {
  const roadmap = roadmaps.find(r => r.id === parseInt(req.params.id));
  if (roadmap) {
    res.json(roadmap);
  } else {
    res.status(404).json({ error: 'Roadmap not found' });
  }
});

app.post('/api/progress', requireAuth, (req, res) => {
  const { roadmapId, taskId, completed } = req.body;
  const userId = req.session.userId;
  
  if (!userProgress[userId]) {
    userProgress[userId] = {};
  }
  
  if (!userProgress[userId][roadmapId]) {
    userProgress[userId][roadmapId] = [];
  }
  
  if (completed) {
    if (!userProgress[userId][roadmapId].includes(taskId)) {
      userProgress[userId][roadmapId].push(taskId);
    }
  } else {
    userProgress[userId][roadmapId] = userProgress[userId][roadmapId].filter(id => id !== taskId);
  }
  
  res.json({ message: 'Progress updated' });
});

app.get('/api/progress/:roadmapId', requireAuth, (req, res) => {
  const userId = req.session.userId;
  const roadmapId = parseInt(req.params.roadmapId);
  
  const completedTasks = userProgress[userId]?.[roadmapId] || [];
  res.json(completedTasks);
});

app.post('/api/roadmaps', requireAuth, requireAdmin, (req, res) => {
  const { title, difficulty, duration, modules } = req.body;
  
  const newRoadmap = {
    id: roadmaps.length + 1,
    title,
    difficulty,
    duration,
    modules: modules.map((module, moduleIndex) => ({
      id: moduleIndex + 1,
      title: module.title,
      tasks: module.tasks.map((task, taskIndex) => ({
        id: taskIndex + 1,
        title: task.title,
        type: task.type || 'Problem',
        link: task.link || '#'
      }))
    }))
  };
  
  roadmaps.push(newRoadmap);
  res.json({ message: 'Roadmap created successfully', roadmap: newRoadmap });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
