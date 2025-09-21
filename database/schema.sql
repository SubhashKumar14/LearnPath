CREATE DATABASE IF NOT EXISTS learning_platform;
USE learning_platform;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

CREATE TABLE courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  difficulty ENUM('Beginner','Intermediate','Advanced') DEFAULT 'Beginner',
  duration VARCHAR(50) DEFAULT '2 hours',
  hero_image VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE modules (
  id INT AUTO_INCREMENT PRIMARY KEY,
  course_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INT DEFAULT 1,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  INDEX idx_course_order (course_id, order_index)
);

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  module_id INT,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_url VARCHAR(500),
  task_type ENUM('video','reading','quiz','assignment') DEFAULT 'reading',
  order_index INT DEFAULT 1,
  FOREIGN KEY (module_id) REFERENCES modules(id) ON DELETE CASCADE,
  INDEX idx_module_order (module_id, order_index)
);

CREATE TABLE user_courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  course_id INT,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  progress INT DEFAULT 0,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  UNIQUE KEY unique_enrollment (user_id, course_id)
);

CREATE TABLE user_progress (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  task_id INT,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
  UNIQUE KEY unique_task_progress (user_id, task_id)
);

CREATE TABLE certificates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  certificate_id VARCHAR(100) UNIQUE,
  user_id INT,
  course_id INT,
  student_name VARCHAR(255),
  course_title VARCHAR(255),
  completion_date DATE,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Sample Data
INSERT INTO courses (title, description, difficulty, duration, hero_image) VALUES
('JavaScript Fundamentals','Master the basics of JavaScript programming','Beginner','8 hours','/images/js-logo.svg'),
('React Development','Build modern web applications with React','Intermediate','12 hours','/images/react-logo.svg'),
('Node.js Backend','Create powerful backend applications','Advanced','15 hours','/images/node-logo.svg');

-- Each course has 5 modules (order_index 1..5)
INSERT INTO modules (course_id, title, description, order_index) VALUES
-- JavaScript Fundamentals (course_id=1)
(1,'Basics & Setup','Environment setup and tooling',1),
(1,'Variables & Data Types','Primitive & reference types',2),
(1,'Functions & Control Flow','Logic, scope & execution',3),
(1,'Arrays & Objects','Collections and data structures',4),
(1,'DOM & Events','Interact with the browser',5),
-- React Development (course_id=2)
(2,'Intro & JSX','Component model & JSX syntax',1),
(2,'Components & Props','Reusable UI building blocks',2),
(2,'State & Hooks','Stateful logic & side-effects',3),
(2,'Routing & Navigation','Client side navigation patterns',4),
(2,'Performance & Optimization','Memoization & lazy loading',5),
-- Node.js Backend (course_id=3)
(3,'Runtime & Modules','Event loop, modules & NPM',1),
(3,'Express Basics','Routing & middleware',2),
(3,'Data Persistence','Working with databases',3),
(3,'Auth & Security','JWT, hashing & validation',4),
(3,'Deployment & Scaling','Process management & scaling',5);

-- 3 tasks per module (module ids assume fresh empty DB so they are sequential 1..15)
INSERT INTO tasks (module_id, title, description, resource_url, task_type, order_index) VALUES
-- JS Module 1 (id 1)
(1,'Install Node & Tools','Install Node.js and a code editor','https://example.com/js/install','reading',1),
(1,'Hello World Script','Write and run your first script','https://example.com/js/hello','assignment',2),
(1,'Execution Model Overview','Understand call stack & event loop','https://example.com/js/event-loop','video',3),
-- JS Module 2 (id 2)
(2,'Numbers & Operations','Work with numbers & math APIs','https://example.com/js/numbers','reading',1),
(2,'Strings & Templates','Template literals & formatting','https://example.com/js/strings','video',2),
(2,'Type Coercion Quiz','Test your understanding of coercion','https://example.com/js/coercion-quiz','quiz',3),
-- JS Module 3 (id 3)
(3,'Function Patterns','Declarations, expressions & arrows','https://example.com/js/functions','reading',1),
(3,'Conditionals Practice','Logical branching exercises','https://example.com/js/conditionals','quiz',2),
(3,'Loop Techniques','for, while, for...of & performance','https://example.com/js/loops','video',3),
-- JS Module 4 (id 4)
(4,'Array Methods','map, filter, reduce deep dive','https://example.com/js/arrays','reading',1),
(4,'Object Manipulation','Destructuring & spread patterns','https://example.com/js/objects','assignment',2),
(4,'JSON & Serialization','Convert and transmit data','https://example.com/js/json','video',3),
-- JS Module 5 (id 5)
(5,'DOM Selection','Query elements efficiently','https://example.com/js/dom-select','reading',1),
(5,'Event Handling','Add interactivity with events','https://example.com/js/events','assignment',2),
(5,'Mini Project Setup','Scaffold a small project','https://example.com/js/mini-project','video',3),
-- React Module 1 (id 6)
(6,'Create React App Setup','Bootstrapping a React project','https://example.com/react/setup','reading',1),
(6,'JSX Essentials','Embedding expressions & rules','https://example.com/react/jsx','video',2),
(6,'Rendering Practice','Practice conditional rendering','https://example.com/react/render','assignment',3),
-- React Module 2 (id 7)
(7,'Component Composition','Compose small pieces into flows','https://example.com/react/composition','reading',1),
(7,'Props Drilling Quiz','Identify prop drill anti-pattern','https://example.com/react/props-quiz','quiz',2),
(7,'Reusable Card Component','Build a configurable card','https://example.com/react/card','assignment',3),
-- React Module 3 (id 8)
(8,'useState & Data Flow','Local state patterns','https://example.com/react/usestate','reading',1),
(8,'Effect & Lifecycle','Data fetching with useEffect','https://example.com/react/useeffect','video',2),
(8,'Custom Hook Exercise','Abstract reusable logic','https://example.com/react/hooks-ex','assignment',3),
-- React Module 4 (id 9)
(9,'React Router Basics','Define routes & links','https://example.com/react/router','reading',1),
(9,'Navigation Quiz','Evaluate nested route behavior','https://example.com/react/router-quiz','quiz',2),
(9,'Protected Routes','Implement auth guarding','https://example.com/react/protected','assignment',3),
-- React Module 5 (id 10)
(10,'Memo & Callback','Optimize re-renders','https://example.com/react/memo','reading',1),
(10,'Performance Profiling','Use React DevTools profiler','https://example.com/react/profile','video',2),
(10,'Lazy Loading Exercise','Code split a route','https://example.com/react/lazy','assignment',3),
-- Node Module 1 (id 11)
(11,'Node Architecture','Understand the event loop','https://example.com/node/arch','reading',1),
(11,'Module Patterns','CommonJS vs ES Modules','https://example.com/node/modules','video',2),
(11,'NPM Scripts Task','Create helpful npm scripts','https://example.com/node/npm-scripts','assignment',3),
-- Node Module 2 (id 12)
(12,'Routing Basics','Set up REST endpoints','https://example.com/node/routing','reading',1),
(12,'Middleware Quiz','Order of execution scenarios','https://example.com/node/mw-quiz','quiz',2),
(12,'Error Handler Build','Centralized error handling','https://example.com/node/errors','assignment',3),
-- Node Module 3 (id 13)
(13,'Connecting to DB','Pool vs single connection','https://example.com/node/db-connect','reading',1),
(13,'Query Builder Video','Parameterized queries','https://example.com/node/queries','video',2),
(13,'CRUD API Exercise','Implement CRUD endpoints','https://example.com/node/crud','assignment',3),
-- Node Module 4 (id 14)
(14,'JWT Auth Flow','Issuing & verifying tokens','https://example.com/node/jwt','reading',1),
(14,'Password Security Quiz','Hashing best practices','https://example.com/node/hash-quiz','quiz',2),
(14,'Role-based Guard','Add role checks to routes','https://example.com/node/rbac','assignment',3),
-- Node Module 5 (id 15)
(15,'PM2 & Clustering','Scale processes horizontally','https://example.com/node/pm2','reading',1),
(15,'Monitoring & Logs','Observability fundamentals','https://example.com/node/logs','video',2),
(15,'Deployment Checklist','Prepare for production','https://example.com/node/deploy','assignment',3);