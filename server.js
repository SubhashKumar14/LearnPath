const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
  secret: 'roadmap-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// MySQL Database Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'roadmap_db'
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    console.log('Creating temporary in-memory storage for demo purposes');
    // For demo purposes, we'll use temporary arrays to simulate database
    global.tempUsers = [];
    global.tempRoadmaps = [];
    global.tempProgress = [];
    global.tempCounter = { users: 1, roadmaps: 1, progress: 1 };
  } else {
    console.log('Connected to MySQL database');
  }
});

// Authentication middleware
const authenticate = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

const adminOnly = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(403).send('Admin access required');
  }
};

// Routes

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Authentication routes
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Using temporary storage for demo
    if (global.tempUsers) {
      const existingUser = global.tempUsers.find(u => u.email === email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      
      const newUser = {
        id: global.tempCounter.users++,
        name,
        email,
        password: hashedPassword,
        role: 'user'
      };
      
      global.tempUsers.push(newUser);
      res.json({ message: 'User registered successfully' });
    } else {
      // Database query would go here
      res.json({ message: 'User registered successfully' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    let user;
    
    if (global.tempUsers) {
      user = global.tempUsers.find(u => u.email === email);
    } else {
      // Database query would go here
    }
    
    if (user && await bcrypt.compare(password, user.password)) {
      req.session.user = { id: user.id, email: user.email, name: user.name, role: user.role };
      
      if (user.role === 'admin') {
        res.json({ redirect: '/admin-dashboard' });
      } else {
        res.json({ redirect: '/user-dashboard' });
      }
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logged out successfully' });
});

// User dashboard routes
app.get('/user-dashboard', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'user-dashboard.html'));
});

app.get('/roadmap/:id', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'roadmap-view.html'));
});

app.get('/progress', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'progress.html'));
});

app.get('/profile', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

// Admin dashboard routes
app.get('/admin-dashboard', authenticate, adminOnly, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/add-roadmap', authenticate, adminOnly, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'add-roadmap.html'));
});

app.get('/manage-roadmaps', authenticate, adminOnly, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'manage-roadmaps.html'));
});

// API routes for roadmaps
app.get('/api/roadmaps', (req, res) => {
  if (global.tempRoadmaps) {
    res.json(global.tempRoadmaps);
  } else {
    // Database query would go here
    res.json([]);
  }
});

app.get('/api/roadmap/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (global.tempRoadmaps) {
    const roadmap = global.tempRoadmaps.find(r => r.id === id);
    if (roadmap) {
      res.json(roadmap);
    } else {
      res.status(404).json({ error: 'Roadmap not found' });
    }
  } else {
    // Database query would go here
    res.status(404).json({ error: 'Roadmap not found' });
  }
});

app.post('/api/roadmaps', authenticate, adminOnly, (req, res) => {
  const { title, difficulty, duration, modules } = req.body;
  
  const newRoadmap = {
    id: global.tempCounter.roadmaps++,
    title,
    difficulty,
    duration,
    modules,
    created_by: req.session.user.id,
    created_at: new Date()
  };
  
  if (global.tempRoadmaps) {
    global.tempRoadmaps.push(newRoadmap);
    res.json({ message: 'Roadmap created successfully', roadmap: newRoadmap });
  } else {
    // Database query would go here
    res.json({ message: 'Roadmap created successfully' });
  }
});

// Progress tracking
app.post('/api/progress', authenticate, (req, res) => {
  const { roadmap_id, module_id, task_id, completed } = req.body;
  
  const progressEntry = {
    id: global.tempCounter.progress++,
    user_id: req.session.user.id,
    roadmap_id,
    module_id,
    task_id,
    completed,
    updated_at: new Date()
  };
  
  if (global.tempProgress) {
    // Remove existing progress for this task
    global.tempProgress = global.tempProgress.filter(p => 
      !(p.user_id === req.session.user.id && 
        p.roadmap_id === roadmap_id && 
        p.module_id === module_id && 
        p.task_id === task_id)
    );
    
    if (completed) {
      global.tempProgress.push(progressEntry);
    }
    
    res.json({ message: 'Progress updated successfully' });
  } else {
    // Database query would go here
    res.json({ message: 'Progress updated successfully' });
  }
});

app.get('/api/progress/:roadmap_id', authenticate, (req, res) => {
  const roadmapId = parseInt(req.params.roadmap_id);
  
  if (global.tempProgress) {
    const userProgress = global.tempProgress.filter(p => 
      p.user_id === req.session.user.id && p.roadmap_id === roadmapId
    );
    res.json(userProgress);
  } else {
    // Database query would go here
    res.json([]);
  }
});

// Get current user info
app.get('/api/user', authenticate, (req, res) => {
  res.json(req.session.user);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
