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
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'in_progress', 'completed', 'cancelled')),
    advisor_comment TEXT,
    approved_at TIMESTAMP,
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

-- Chat messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
    sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('student', 'advisor')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_chat_messages_project ON chat_messages(project_id);
CREATE INDEX idx_chat_messages_created ON chat_messages(created_at DESC);

INSERT INTO users (email, password_hash, full_name, role, is_verified, student_id) VALUES
('admin@rumail.ru.ac.th', '$2a$10$ZMug6Ajy03J14alMl9/SFO6azhvL5fMLTfXQjYHl0tgUY1IAKP4GK', 'ผู้ดูแลระบบ', 'admin', TRUE, NULL),
('advisor1@rumail.ru.ac.th', '$2a$10$aNAqEY0fUm3mlovQ2SNaxuu8L.VNFc8fXPxkn18kOzWZMh1jRQBku', 'ผศ.ดร.สมชาย วิทยาคอม', 'advisor', TRUE, NULL),
('advisor2@rumail.ru.ac.th', '$2a$10$aNAqEY0fUm3mlovQ2SNaxuu8L.VNFc8fXPxkn18kOzWZMh1jRQBku', 'รศ.ดร.สมศรี เทคโนโลยี', 'advisor', TRUE, NULL),
('advisor3@rumail.ru.ac.th', '$2a$10$aNAqEY0fUm3mlovQ2SNaxuu8L.VNFc8fXPxkn18kOzWZMh1jRQBku', 'อ.ดร.วิชาญ โปรแกรม', 'advisor', TRUE, NULL),
('student1@rumail.ru.ac.th', '$2a$10$aNAqEY0fUm3mlovQ2SNaxuu8L.VNFc8fXPxkn18kOzWZMh1jRQBku', 'นางสาวสมหญิง ใจดี', 'student', TRUE, '6504016665'),
('student2@rumail.ru.ac.th', '$2a$10$aNAqEY0fUm3mlovQ2SNaxuu8L.VNFc8fXPxkn18kOzWZMh1jRQBku', 'นายสมชาย รักเรียน', 'student', TRUE, '6504016666');

-- Insert sample advisors
INSERT INTO advisors (user_id, title, specialization, research_interests, max_students) VALUES
((SELECT id FROM users WHERE email = 'advisor1@rumail.ru.ac.th'), 'ผศ.ดร.', 
 ARRAY['Web Development', 'Database Systems', 'Software Engineering'], 
 'การพัฒนาเว็บแอปพลิเคชัน, ระบบฐานข้อมูล', 8),
((SELECT id FROM users WHERE email = 'advisor2@rumail.ru.ac.th'), 'รศ.ดร.', 
 ARRAY['Machine Learning', 'Data Science', 'AI'], 
 'ปัญญาประดิษฐ์, การเรียนรู้ของเครื่อง, วิทยาการข้อมูล', 6),
((SELECT id FROM users WHERE email = 'advisor3@rumail.ru.ac.th'), 'อ.ดร.', 
 ARRAY['Mobile Development', 'Game Development', 'UI/UX'], 
 'การพัฒนาแอปพลิเคชันมือถือ, การออกแบบเกม', 5);

-- Insert sample students
INSERT INTO students (user_id, year, gpa, status) VALUES
((SELECT id FROM users WHERE email = 'student1@rumail.ru.ac.th'), 4, 3.25, 'active'),
((SELECT id FROM users WHERE email = 'student2@rumail.ru.ac.th'), 3, 3.50, 'active');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, priority, is_read) VALUES
((SELECT id FROM users WHERE email = 'admin@rumail.ru.ac.th'), 'ยินดีต้อนรับ', 'ยินดีต้อนรับเข้าสู่ระบบจัดการโครงงานพิเศษ', 'info', 'medium', FALSE),
((SELECT id FROM users WHERE email = 'admin@rumail.ru.ac.th'), 'อัพเดทระบบ', 'ระบบได้รับการอัพเดทเป็นเวอร์ชันล่าสุดแล้ว', 'success', 'low', FALSE),
((SELECT id FROM users WHERE email = 'admin@rumail.ru.ac.th'), 'การแจ้งเตือน', 'กรุณาตรวจสอบข้อมูลส่วนตัวให้ครบถ้วน', 'warning', 'high', FALSE);