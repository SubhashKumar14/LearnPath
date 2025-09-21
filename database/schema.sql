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
('JavaScript Fundamentals','Master the basics of JavaScript programming','Beginner','8 hours','https://via.placeholder.com/600x300/4361ee/ffffff?text=JavaScript'),
('React Development','Build modern web applications with React','Intermediate','12 hours','https://via.placeholder.com/600x300/3f37c9/ffffff?text=React'),
('Node.js Backend','Create powerful backend applications','Advanced','15 hours','https://via.placeholder.com/600x300/4cc9f0/ffffff?text=Node.js');

INSERT INTO modules (course_id, title, description, order_index) VALUES
(1,'Variables and Data Types','Learn about JavaScript variables and data types',1),
(1,'Functions and Control Flow','Master JavaScript functions and control structures',2),
(2,'React Basics','Introduction to React components and JSX',1),
(2,'State Management','Learn React hooks and state management',2);

INSERT INTO tasks (module_id, title, description, resource_url, task_type, order_index) VALUES
(1,'Introduction to Variables','Learn how to declare and use variables','https://example.com/variables','video',1),
(1,'Working with Strings','Master string manipulation techniques','https://example.com/strings','reading',2),
(2,'Creating Functions','Write your first JavaScript functions','https://example.com/functions','assignment',1),
(3,'Your First Component','Build a React component from scratch','https://example.com/react-component','video',1);