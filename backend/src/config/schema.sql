CREATE DATABASE IF NOT EXISTS ssem_db;
USE ssem_db;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE virtual_machines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    os_type ENUM('ubuntu', 'kali') DEFAULT 'ubuntu',
    status ENUM('running', 'stopped') DEFAULT 'stopped',
    vnc_port INT,
    novnc_port INT,
    container_id VARCHAR(255),
    vnc_link VARCHAR(512),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);