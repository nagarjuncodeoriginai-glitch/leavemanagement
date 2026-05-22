/**
 * Database Seed Script
 * Run: npx ts-node src/database/seed.ts
 * 
 * This script seeds the HR admin account with encrypted credentials.
 * HR Credentials: username: codeorigin, password: hrcodeoriginai@1234
 */

import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

async function seed() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306"),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    console.log("Creating database...");
    await connection.execute("CREATE DATABASE IF NOT EXISTS hr_management");
    await connection.execute("USE hr_management");

    console.log("Creating tables...");

    // HR Admin table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS hr_admin (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Employees table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT PRIMARY KEY AUTO_INCREMENT,
        emp_id VARCHAR(20) NOT NULL UNIQUE,
        full_name VARCHAR(200) NOT NULL,
        email VARCHAR(200) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        gender ENUM('Male', 'Female', 'Other') NOT NULL,
        date_of_birth DATE,
        address TEXT,
        department VARCHAR(100) NOT NULL,
        designation VARCHAR(100) NOT NULL,
        manager_name VARCHAR(200),
        doj DATE NOT NULL,
        employment_type ENUM('Full-Time', 'Part-Time', 'Contract', 'Intern') DEFAULT 'Full-Time',
        probation_period VARCHAR(50),
        confirmation_date DATE,
        work_location VARCHAR(200),
        shift_timing VARCHAR(100),
        salary_package VARCHAR(100),
        bank_account_number VARCHAR(50),
        ifsc_code VARCHAR(20),
        pan_number VARCHAR(20),
        aadhaar_number VARCHAR(20),
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive', 'on_probation') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_department (department),
        INDEX idx_status (status),
        INDEX idx_emp_id (emp_id)
      )
    `);

    // Leaves table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leaves (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        leave_type ENUM('CL') DEFAULT 'CL',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT NOT NULL,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP NULL,
        reviewed_by VARCHAR(100),
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        INDEX idx_employee_id (employee_id),
        INDEX idx_status (status),
        INDEX idx_dates (start_date, end_date)
      )
    `);

    // Leave Balance table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS leave_balance (
        id INT PRIMARY KEY AUTO_INCREMENT,
        employee_id INT NOT NULL,
        month INT NOT NULL,
        year INT NOT NULL,
        total_cl INT DEFAULT 2,
        used_cl INT DEFAULT 0,
        remaining_cl INT DEFAULT 2,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        UNIQUE KEY uk_employee_month_year (employee_id, month, year),
        INDEX idx_month_year (month, year)
      )
    `);

    // Seed HR Admin
    console.log("Seeding HR admin account...");
    const hrPassword = await bcrypt.hash("hrcodeoriginai@1234", 12);
    
    await connection.execute(
      `INSERT INTO hr_admin (username, password) VALUES (?, ?) ON DUPLICATE KEY UPDATE password = ?`,
      ["codeorigin", hrPassword, hrPassword]
    );

    console.log("Database seeded successfully!");
    console.log("HR Admin Credentials:");
    console.log("  Username: codeorigin");
    console.log("  Password: hrcodeoriginai@1234");
  } catch (error) {
    console.error("Seed error:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

seed().catch(console.error);
