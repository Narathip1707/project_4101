# Project 4101 – Quick Start (Docker)

เอกสารฉบับย่อสำหรับให้ผู้อื่นอ่านแล้วสามารถ Build/Run ระบบได้ทันที ทั้ง Backend + Database และวิธีรัน Frontend แยก

## สิ่งที่ต้องมี
- Docker Desktop (มี Docker Compose v2 มาให้แล้ว)
- Windows PowerShell, macOS Terminal หรือ Linux shell
- สำหรับ Frontend: Node.js 20 ขึ้นไป, npm

## เริ่มต้นอย่างรวดเร็ว (Backend + Database)
1) เปิดเทอร์มินัลที่โฟลเดอร์โปรเจกต์
- project_4101

2) สั่งรันบริการทั้งหมดด้วย Docker Compose
- docker compose up -d

3) ตรวจสถานะ Log (ไม่บังคับ)
- docker compose logs db --tail=100
- docker compose logs backend --tail=100

4) ทดสอบ Backend
- เปิดเบราว์เซอร์ไปที่ http://localhost:3001/
- ควรเห็น JSON ตอบกลับ เช่น {"message":"Welcome to Project Management API","status":"running"}

หมายเหตุ
- คอนเทนเนอร์ db จะสร้างฐานข้อมูลและตารางโดยอัตโนมัติจากสคริปต์ db/init.sql
- หากเห็นคำเตือนว่า version ใน docker-compose.yml ล้าสมัย สามารถละไว้ก่อนได้ (ไม่มีผลต่อการรัน)

## หยุดระบบ
- docker compose down

## รีเซ็ตฐานข้อมูลและ Build ใหม่ทั้งหมด
กรณีต้องการล้างข้อมูลเดิมและแก้ปัญหา locale/ตั้งค่าเริ่มต้นใหม่:
- docker compose down -v
- docker compose build --no-cache
- docker compose up -d

## เข้าถึงฐานข้อมูล (psql)
- docker exec -it project_4101-db-1 psql -U postgres -d project_management_system

## API เบื้องต้น
- GET /  ตรวจสอบสถานะเซิร์ฟเวอร์
- POST /api/signup  สมัครผู้ใช้ใหม่ (role เริ่มต้นเป็น student)
  - ตัวอย่างข้อมูลส่งเข้า
    {
      "email": "someone@rumail.ru.ac.th",
      "password": "yourpassword",
      "fullName": "Your Name"
    }
- POST /api/login  เข้าสู่ระบบ
  - ตัวอย่างข้อมูลส่งเข้า
    {
      "email": "someone@rumail.ru.ac.th",
      "password": "yourpassword"
    }
หมายเหตุ: ระบบจำกัดอีเมลต้องลงท้ายด้วย @rumail.ru.ac.th

## รัน Frontend (Next.js) แยก
โฟลเดอร์: frontend
1) ติดตั้งแพ็กเกจ
- cd frontend
- npm install
- cd backend
- go mod tidy

2) โหมดพัฒนา
- npm run dev
- เปิด http://localhost:3000

3) โหมดโปรดักชัน
- npm run dev
- npm start

## การแก้ปัญหาที่พบบ่อย
- พอร์ตชนกัน (เช่น 5432 หรือ 3001 ถูกใช้อยู่)
  - แก้ไข mapping พอร์ตใน docker-compose.yml แล้วสั่ง docker compose up -d ใหม่
- Locale/ภาษาของ Postgres ไม่ถูกต้อง
  - โปรเจกต์นี้สร้างอิมเมจที่ติดตั้ง th_TH.utf8 ให้แล้ว หากเจอ error เก่า ให้รันรีเซ็ตฐานข้อมูล: docker compose down -v; docker compose build --no-cache; docker compose up -d
- Backend ไม่เชื่อมต่อ DB
  - ตรวจสอบว่าสถานะ db เป็น healthy: docker compose ps
  - ดู log: docker compose logs db --tail=200 และ docker compose logs backend --tail=200

## โครงสร้างสำคัญ
- backend/  โค้ด Go Fiber + GORM เชื่อมต่อ Postgres ที่ service ชื่อ db
- db/       อิมเมจ Postgres พร้อม init.sql สำหรับสร้างตาราง/ข้อมูลตั้งต้น
- frontend/ แอป Next.js (รันแยกด้วย Node.js)

พร้อมใช้งาน หากมีคำถามเพิ่มเติมให้ดู log ตามหัวข้อด้านบนหรือแจ้งผู้ดูแลโปรเจกต์