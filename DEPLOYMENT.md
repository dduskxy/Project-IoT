# คู่มือการนำโปรเจกต์ขึ้น Vercel (Deployment Guide)

คู่มือนี้จะสอนวิธีนำโปรเจกต์ Next.js ของคุณ (โฟลเดอร์ `web`) ไปฝากไว้บน GitHub และ Deploy ขึ้น Vercel แบบฟรีๆ พร้อมการตั้งค่าตัวแปร (Environment Variables) ให้ครบถ้วน

## ขั้นตอนที่ 1: นำโค้ดขึ้น GitHub

1. สมัครสมาชิกและเข้าสู่ระบบ [GitHub](https://github.com/)
2. สร้าง Repository ใหม่:
   - กดปุ่ม **New** ตรงเมนู Repositories
   - ตั้งชื่อ Repository (เช่น `iot-dashboard`)
   - เลือกว่าจะเป็น Public (สาธารณะ) หรือ Private (ส่วนตัว)
   - กดปุ่ม **Create repository**
3. เปิด Terminal หรือ Command Prompt ในเครื่องของคุณ และเข้าไปที่โฟลเดอร์ `web`:
   ```bash
   cd C:\Users\asus\Project-IoT\web
   ```
4. รันคำสั่งต่อไปนี้ทีละบรรทัด (เปลี่ยน `<YOUR_GITHUB_USERNAME>` และ `<REPO_NAME>` เป็นของคุณ):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/<REPO_NAME>.git
   git push -u origin main
   ```

## ขั้นตอนที่ 2: เชื่อมต่อ Vercel

1. เข้าเว็บไซต์ [Vercel](https://vercel.com/) และสมัครสมาชิกด้วยบัญชี GitHub ของคุณ
2. เมื่อเข้าสู่ระบบเสร็จแล้ว ให้กดปุ่ม **Add New...** -> **Project**
3. Vercel จะแสดงรายการ Repositories ใน GitHub ของคุณ ให้กดปุ่ม **Import** ที่ Repository ที่เพิ่งสร้างไว้
4. ในหน้าจอ Configure Project:
   - **Framework Preset**: Vercel จะตรวจสอบอัตโนมัติว่าเป็น `Next.js`
   - **Root Directory**: ให้เป็น `./` (หรือเลือกโฟลเดอร์ `web` หากคุณเอาโค้ดทั้ง `Project-IoT` ขึ้น GitHub)
5. **การตั้งค่า Environment Variables (สำคัญมาก)**:
   คุณต้องคัดลอกค่าจากไฟล์ `.env.local` ไปใส่ใน Vercel
   - เปิดโฟลเดอร์โปรเจกต์ `web` แล้วเปิดไฟล์ `.env.local`
   - นำตัวแปรเหล่านี้ไปเพิ่มในหัวข้อ **Environment Variables** ใน Vercel:
     - ชื่อตัวแปร: `NEXT_PUBLIC_SUPABASE_URL` | ค่าตัวแปร: `https://bwoelvninosbpalqlymm.supabase.co`
     - ชื่อตัวแปร: `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ค่าตัวแปร: `sb_publishable_UacTEmeC6HJFcqdPqjicaQ__7sA4Qh9`
   - กดปุ่ม **Add** ทีละตัว
6. กดปุ่ม **Deploy**
7. รอสักครู่ Vercel จะทำการ Build โค้ดของคุณ เมื่อเสร็จสิ้น คุณจะได้รับ URL สำหรับเข้าชมเว็บไซต์ของคุณได้ทันที!

## คำแนะนำเพิ่มเติม
- หากมีการแก้ไขโค้ดและต้องการอัปเดตเว็บไซต์ เพียงแค่รัน `git add .`, `git commit -m "อัปเดตงาน"`, และ `git push` โค้ดจะถูกดึงไปอัปเดตบน Vercel อัตโนมัติ
- อย่าเผลอนำไฟล์ `.env.local` ขึ้น GitHub เพราะอาจทำให้ข้อมูล Key สำคัญหลุด (ใน `.gitignore` มีการตั้งค่าป้องกันไว้แล้ว)
