# Project 4101 - Database Setup Guide

This README provides step-by-step instructions to set up the database for the Project 4101 management system, as developed with Grok 3 by xAI. The database is built using PostgreSQL and includes all necessary tables and configurations.

## Prerequisites
- PostgreSQL installed and running (version 12 or higher recommended)
- Access to a PostgreSQL user with sufficient privileges (e.g., `youruser` with password `yourpassword`)
- A terminal or SQL client (e.g., psql, pgAdmin)

## Database Creation and Setup

###  Create the Database
Run the following SQL command to create the `project_management_system` database. Note that the collation and encoding must match your PostgreSQL server's template database settings. If you encounter a collation mismatch (e.g., `en_US.UTF-8` vs. `Thai_Thailand.874`), adjust the `LC_COLLATE` and `LC_CTYPE` to match your server's default (e.g., `Thai_Thailand.874`).

```sql
CREATE DATABASE project_management_system
    WITH ENCODING = 'UTF8'
    LC_COLLATE = 'Thai_Thailand.874'  -- Adjust based on your server (e.g., 'en_US.UTF-8')
    LC_CTYPE = 'Thai_Thailand.874';   -- Adjust based on your server
```

### Create Tables and Extensions
Run the following SQL script to create the necessary tables, indexes, triggers, and initial data. Ensure the uuid-ossp extension is available (install it if needed with CREATE EXTENSION IF NOT EXISTS "uuid-ossp"; as a superuser).

```sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL CHECK (email LIKE '%@rumail.ru.ac.th'),
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    student_id VARCHAR(20),
    employee_id VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'advisor', 'admin')),
    department VARCHAR(100) DEFAULT 'วิทยาการคอมพิวเตอร์',
    phone VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    profile_image TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Advisors table
CREATE TABLE advisors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(50) NOT NULL,
    specialization TEXT[],
    research_interests TEXT,
    office_location VARCHAR(100),
    office_hours TEXT,
    max_students INTEGER DEFAULT 5,
    current_students INTEGER DEFAULT 0,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_max_students CHECK (current_students <= max_students)
);

-- Students table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    gpa DECIMAL(3,2),
    advisor_id UUID REFERENCES advisors(id),
    enrollment_year INTEGER,
    graduation_year INTEGER,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'dropped', 'suspended')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    advisor_id UUID REFERENCES advisors(id),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    objectives TEXT,
    scope TEXT,
    methodology TEXT,
    expected_outcome TEXT,
    keywords TEXT[],
    status VARCHAR(20) DEFAULT 'proposal' CHECK (status IN ('proposal', 'approved', 'in_progress', 'completed', 'cancelled')),
    start_date DATE,
    expected_end_date DATE,
    actual_end_date DATE,
    grade VARCHAR(5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Files table
CREATE TABLE project_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES users(id),
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size BIGINT,
    file_type VARCHAR(100),
    file_category VARCHAR(50) CHECK (file_category IN ('proposal', 'progress_report', 'final_report', 'presentation', 'source_code', 'other')),
    file_status VARCHAR(20) DEFAULT 'pending' CHECK (file_status IN ('pending', 'approved', 'rejected')),
    version INTEGER DEFAULT 1,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_read BOOLEAN DEFAULT FALSE,
    related_project_id UUID REFERENCES projects(id),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System Settings table
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Logs table
CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_projects_student_id ON projects(student_id);
CREATE INDEX idx_projects_advisor_id ON projects(advisor_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_project_files_project_id ON project_files(project_id);
CREATE INDEX idx_project_files_file_status ON project_files(file_status);
CREATE INDEX idx_logs_user_id ON logs(user_id);

-- Create Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$  
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
  $$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_advisors_updated_at BEFORE UPDATE ON advisors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_project_files_updated_at BEFORE UPDATE ON project_files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create Trigger for advisor capacity
CREATE OR REPLACE FUNCTION check_advisor_capacity()
RETURNS TRIGGER AS $$  
BEGIN
    IF (SELECT current_students FROM advisors WHERE id = NEW.advisor_id) >= 
       (SELECT max_students FROM advisors WHERE id = NEW.advisor_id) THEN
        RAISE EXCEPTION 'Advisor has reached maximum student capacity';
    END IF;
    RETURN NEW;
END;
  $$ LANGUAGE 'plpgsql';

CREATE TRIGGER check_advisor_capacity_trigger 
BEFORE INSERT OR UPDATE ON students 
FOR EACH ROW 
WHEN (NEW.advisor_id IS NOT NULL)
EXECUTE FUNCTION check_advisor_capacity();

-- Initial Data
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('site_name', 'ระบบจัดการโครงงานพิเศษ', 'ชื่อของเว็บไซต์'),
('academic_year', '2568', 'ปีการศึกษาปัจจุบัน'),
('registration_open', 'true', 'เปิดให้สมัครสมาชิกหรือไม่'),
('max_file_size_mb', '50', 'ขนาดไฟล์สูงสุดที่อัปโหลดได้ (MB)'),
('allowed_file_types', 'pdf,doc,docx,ppt,pptx,zip,rar', 'ประเภทไฟล์ที่อนุญาต'),
('notification_email_enabled', 'true', 'เปิดใช้งานการแจ้งเตือนผ่าน Email');

INSERT INTO users (email, password_hash, full_name, role, is_verified) VALUES
('admin@rumail.ru.ac.th', '$2a$10$8K1p/a0dqbQiuiO2ARVAve4FyCPAlbqULpTyGVWi1Pzt.Wz6xvJHS', 'ผู้ดูแลระบบ', 'admin', TRUE);

```