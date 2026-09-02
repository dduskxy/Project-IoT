# Project-IoT

> **IoT System using ESP32 + Supabase + Web Dashboard + LLM**

โปรเจกต์นี้เป็นระบบ Internet of Things (IoT) ที่ใช้ **ESP32 เป็นตัวควบคุม Hardware หลัก** เชื่อมต่อกับ Sensor, LED และ Servo Motor ผ่าน Wi-Fi และเชื่อมกับ Supabase เพื่อจัดเก็บข้อมูลและรับส่งคำสั่ง

ระบบมี Web Dashboard สำหรับดูข้อมูล/ควบคุมอุปกรณ์ และมี LLM สำหรับรับคำสั่งภาษาธรรมชาติ

---

# 1. Project Overview

```text
                         USER
                           │
                           ↓
                    ┌─────────────┐
                    │     LLM     │
                    │ AI Interface│
                    └──────┬──────┘
                           ↕
                    ┌─────────────┐
                    │     WEB     │
                    │  Dashboard  │
                    └──────┬──────┘
                           ↕
                    ┌─────────────┐
                    │  SUPABASE   │
                    │ Data+Command│
                    └──────┬──────┘
                           ↕
                          Wi-Fi
                           ↕
                    ┌─────────────┐
                    │    ESP32    │
                    │Main Controller│
                    └──┬────┬────┬┘
                       ↓    ↓    ↓
                    Sensor LED Servo
```

ระบบต้องรองรับ Two-Way Communication

### Data Flow

```text
Sensor → ESP32 → Wi-Fi → Supabase → Web / LLM
```

### Control Flow

```text
LLM / Web → Supabase → Wi-Fi → ESP32 → LED / Servo
```

---

# 2. Component Responsibilities

## ESP32

**ESP32 = Main Hardware Controller**

หน้าที่:
- Connect Wi-Fi
- Reconnect เมื่อ Wi-Fi หลุด
- Read Sensor
- Validate Sensor Data
- Send Sensor Data → Supabase
- Read Command ← Supabase
- Validate Command
- Control LED
- Control Servo Motor
- Report Device Status
- Handle Network/API Errors

ESP32 คือ Bridge ระหว่าง Physical Hardware และ Cloud

## Sensor

**Sensor = Input**

```text
Sensor → ESP32 → Supabase
```

ชนิด Sensor จริงต้องตรวจสอบจาก Repository หรือ Hardware

**ห้ามเดาชนิด Sensor, รุ่น Sensor หรือ GPIO**

## LED

**LED = Output**

```text
Web / LLM
    ↓
Supabase
    ↓
ESP32
    ↓
GPIO
    ↓
LED
```

ตัวอย่าง:

```json
{"device":"LED","command":"ON"}
```

```json
{"device":"LED","command":"OFF"}
```

## Servo Motor

**Servo = Output / Actuator**

```text
Web / LLM
    ↓
Supabase
    ↓
ESP32
    ↓
Servo
```

ตัวอย่าง:

```json
{
  "device": "SERVO",
  "command": "SET_POSITION",
  "value": 90
}
```

ห้ามสมมติว่า Servo ควบคุมอะไร และห้ามสมมติช่วงองศาโดยไม่มีข้อมูล Hardware จริง

## Wi-Fi

เป็น Network Layer ระหว่าง ESP32 และ Cloud

## Supabase

**Supabase = Central Cloud Database + Command Layer**

ใช้สำหรับ:
- Sensor Data
- Device Status
- Commands
- Timestamps
- Command Execution Status

## Web Dashboard

**Web = Monitoring + Control Interface**

ควรแสดง:
- Sensor Data
- Sensor History
- LED Status
- Servo Position
- Device Online/Offline
- Last Update
- LED Control
- Servo Control
- Command Status
- LLM Interface

ห้ามใช้ค่าที่ Hard-code แทนสถานะจริง

## LLM

**LLM = Natural Language Interface**

LLM ไม่ควบคุม GPIO โดยตรง

หน้าที่:
1. รับข้อความจาก User
2. วิเคราะห์ Intent
3. สร้าง Structured Command
4. Validate
5. ส่งคำสั่งผ่าน Web/Backend → Supabase
6. อ่านข้อมูลจาก Supabase เมื่อผู้ใช้ถาม
7. ตอบ User

ตัวอย่าง:

User:
```text
เปิดไฟ
```

LLM:
```json
{
  "device": "LED",
  "command": "ON"
}
```

Flow:

```text
User → LLM → Validation → Supabase → ESP32 → LED
```

---

# 3. Complete Data Flow

## Sensor Telemetry

```text
Physical Sensor
      ↓
ESP32
      ↓
Read + Validate
      ↓
Wi-Fi
      ↓
Supabase
      ↓
Database
      ↓
Web / LLM
```

## LED Control

```text
User
  ↓
Web / LLM
  ↓
Structured Command
  ↓
Validation
  ↓
Supabase
  ↓
ESP32
  ↓
GPIO
  ↓
LED
```

## Servo Control

```text
User
  ↓
Web / LLM
  ↓
Structured Command
  ↓
Validation
  ↓
Supabase
  ↓
ESP32
  ↓
Servo
```

---

# 4. Supabase Data Model

ต้องตรวจสอบ Database ที่มีอยู่ก่อนสร้างหรือแก้ไข

Conceptual structure:

## sensor_data

```text
id
device_id
sensor_type
value
unit
timestamp
```

## device_status

```text
id
device_id
led_status
servo_position
online_status
updated_at
```

## commands

```text
id
device_id
device
command
value
status
created_at
executed_at
```

รายการนี้เป็น Conceptual Schema เท่านั้น ไม่ใช่การบังคับชื่อ Field

**ห้ามสร้าง Table ซ้ำโดยไม่ตรวจสอบของเดิม**

---

# 5. Command Lifecycle

แนวคิด:

```text
CREATED
   ↓
PENDING
   ↓
PROCESSING
   ↓
EXECUTED
```

กรณีผิดพลาด:

```text
PENDING
   ↓
FAILED
```

ทุก Command ควรมี Unique ID และต้องป้องกันการ Execute ซ้ำ

---

# 6. Device Status Synchronization

หลัง ESP32 execute คำสั่งสำเร็จ ให้รายงานสถานะกลับ Supabase

ตัวอย่าง:

```text
ESP32 executes LED ON
        ↓
Update Supabase
        ↓
device_status = ON
```

Web ต้องอ่านสถานะจริงจาก Backend/Device ไม่ควรเปลี่ยนสถานะ UI เพียงเพราะผู้ใช้กดปุ่ม

---

# 7. LLM Security

ห้าม:

```text
LLM → GPIO
```

ต้องเป็น:

```text
User Input
   ↓
LLM
   ↓
Structured Command
   ↓
Validation
   ↓
Supabase
   ↓
ESP32
   ↓
Hardware
```

ต้อง Validate:
- Device
- Command
- Parameter
- Data Type
- Value
- Range
- Command Format

---

# 8. Development Roadmap

## Phase 0 — Repository Audit

ก่อน Coding:
1. Inspect Repository
2. Inspect Folder Structure
3. Inspect ESP32 Code
4. Inspect Web Code
5. Inspect Configuration
6. Inspect Database Code
7. Inspect Supabase Project
8. Inspect Dependencies
9. Identify existing features
10. Identify missing features
11. Identify broken features
12. Create implementation plan

**ห้ามล้างหรือ Rewrite ทั้งโปรเจกต์ทันที**

## Phase 1 — Supabase → ESP32 → LED

เป้าหมาย: Cloud สามารถควบคุม LED จริง

## Phase 2 — Sensor → ESP32 → Supabase

เป้าหมาย: Sensor Data จริงถูกส่งและเก็บใน Supabase

## Phase 3 — Web ↔ Supabase

เป้าหมาย: Web อ่านข้อมูลและสร้าง Command ได้

## Phase 4 — Servo

เป้าหมาย: เพิ่ม Servo Control ผ่าน Architecture เดิม

## Phase 5 — LLM

เป้าหมาย: Natural Language → Validated Structured Command

## Phase 6 — Full Integration

```text
Sensor
  ↕
ESP32
  ↕
Supabase
  ↕
Web
  ↕
LLM
```

---

# 9. ESP32 Software Architecture

ใช้โครงสร้างเดิมของ Repository หากเหมาะสม

Conceptual modules:

```text
esp32/
├── main
├── wifi
├── supabase
├── sensor
├── led
├── servo
├── commands
├── device_status
└── config
```

แยกความรับผิดชอบ:
- wifi = connection/reconnection
- supabase = cloud communication
- sensor = read/validate
- led = ON/OFF
- servo = position control
- commands = fetch/parse/validate/execute
- device_status = state reporting
- config = non-secret configuration

---

# 10. Web Architecture

ตรวจสอบ Framework เดิมก่อนเปลี่ยน

แยก:
- UI
- Dashboard
- Sensor View
- Device Controls
- Command Status
- LLM Interface
- Supabase Client
- Backend/API
- LLM Integration
- State Management

---

# 11. Security

ห้าม Commit:
- Password
- Private API Key
- Supabase Service Role Key
- Secret Token
- Sensitive Credentials

ใช้ Environment Variables หรือ Secure Configuration

ห้ามเปิดเผย Privileged Credentials ใน Frontend

---

# 12. Error Handling

## ESP32

ต้องจัดการ:
- Wi-Fi Disconnect
- Wi-Fi Reconnect
- API Error
- HTTP Timeout
- Invalid JSON
- Invalid Command
- Duplicate Command
- Sensor Failure
- Invalid Sensor Data
- Invalid Servo Value

## Web

ต้องจัดการ:
- Loading
- Empty Data
- Backend Failure
- Device Offline
- Command Failure
- LLM Failure
- Stale Data

## LLM

ต้องจัดการ:
- Unsupported Request
- Ambiguous Request
- Missing Parameter
- Invalid Value
- Invalid Output

---

# 13. Observability

ESP32 ควร Log:

```text
Wi-Fi Status
API Status
Sensor Read
Command Received
Command Validation
Command Execution
Command Failure
Device Status Update
```

ข้อมูลสำคัญควรมี Timestamp

---

# 14. Extensibility

ระบบควรเพิ่ม Hardware ในอนาคตได้ เช่น:
- Additional Sensors
- Additional LEDs
- Relay
- Motor
- Display
- Additional Actuators

แนวคิดกลาง:

```text
device
command
value
status
timestamp
```

---

# 15. Supabase MCP for AI Agents

เมื่อ AI Agent มี Supabase MCP:

```text
AI AGENT
    │
    ├──────────────→ GitHub
    │                dduskxy/Project-IoT
    │
    └── MCP ───────→ Supabase
```

GitHub ใช้สำหรับ:
- Source Code
- ESP32
- Web
- Documentation
- Config Templates

Supabase MCP ใช้สำหรับ:
- Inspect Database
- Inspect Tables
- Inspect Policies
- Inspect Functions
- Inspect Backend Resources
- Manage Database when necessary

หลักการ:

```text
INSPECT
  ↓
UNDERSTAND
  ↓
PLAN
  ↓
MODIFY
  ↓
VERIFY
```

ห้ามสร้าง Table / Policy / Function ซ้ำโดยไม่ตรวจสอบของเดิม

---

# 16. AI Agent Operating Rules

ก่อน Coding:

```text
1. Inspect repository
2. Inspect current files
3. Inspect architecture
4. Inspect configuration
5. Inspect Supabase when available
6. Identify implemented features
7. Identify missing features
8. Identify broken features
9. Create plan
10. Implement
```

ระหว่างพัฒนา:
- ห้ามลบของเดิมโดยไม่จำเป็น
- ห้าม Rewrite ทั้งโปรเจกต์โดยพลการ
- ห้ามสร้าง Database ซ้ำ
- ห้ามสร้าง Table ซ้ำ
- ห้ามเดา Hardware
- ห้ามเดา GPIO
- ห้ามเดา Sensor
- ห้ามเดาหน้าที่ Servo
- ห้าม Hard-code Secret
- ต้องแยก Layer
- ต้อง Validate Command
- ต้อง Handle Error
- ต้องทดสอบทุก Phase

หลังแก้ไข:
- Review Diff
- Run Tests
- Run Build/Lint เมื่อมี
- Verify Configuration
- Verify Database
- Verify End-to-End Behavior
- Update Documentation

ห้ามอ้างว่า Feature ทำงานแล้ว หากยังไม่ได้ทดสอบหรือยืนยัน

---

# 17. Do Not Make Unverified Assumptions

ห้ามเดา:

```text
Sensor Model
GPIO Pins
Servo Purpose
Wi-Fi Credentials
Supabase URL
API Keys
Database Schema
Framework
LLM Provider
Hardware Wiring
```

ลำดับ:

```text
Inspect Repository
      ↓
Inspect Supabase
      ↓
Inspect Configuration
      ↓
Check Documentation
      ↓
Still Unknown?
      ↓
Mark as unresolved
      ↓
Ask when necessary
```

---

# 18. Testing

## Hardware

```text
ESP32 Boot
Wi-Fi
Sensor
LED
Servo
```

## Supabase

```text
Insert Sensor Data
Read Sensor Data
Create Command
Update Command
Update Device Status
```

## Web

```text
Dashboard Load
Sensor Display
Device Status
Command Creation
Status Synchronization
```

## LLM

```text
เปิดไฟ
ปิดไฟ
ตั้ง Servo เป็น 90 องศา
ตอนนี้ Sensor มีค่าเท่าไหร่
```

ต้องทดสอบ Invalid / Unsupported / Missing Parameter / Invalid Value ด้วย

---

# 19. GitHub Workflow

Repository:

```text
dduskxy/Project-IoT
```

Clone:

```bash
gh repo clone dduskxy/Project-IoT
cd Project-IoT
```

ก่อนแก้:

```bash
git status
```

หลังแก้:

```bash
git diff
```

จากนั้น:

```text
Test
 ↓
Build
 ↓
Lint
 ↓
Review
 ↓
Commit
```

---

# 20. Recommended Repository Structure

ถ้าโครงสร้างเดิมยังไม่เหมาะสม:

```text
Project-IoT/
├── esp32/
├── web/
├── supabase/
├── docs/
├── README.md
└── .env.example
```

Documentation:

```text
docs/
├── architecture.md
├── database.md
├── esp32.md
├── api.md
├── llm.md
├── setup.md
└── troubleshooting.md
```

หากโครงสร้างเดิมดีอยู่แล้ว ให้ใช้ของเดิม

---

# 21. Success Criteria

- [ ] ESP32 Boot
- [ ] Wi-Fi Connection
- [ ] Sensor Reading
- [ ] Sensor Data → Supabase
- [ ] Web Sensor Display
- [ ] Web Device Status
- [ ] Web Command Creation
- [ ] ESP32 Command Reception
- [ ] LED Control
- [ ] Servo Control
- [ ] Device Status Synchronization
- [ ] Command Execution Status
- [ ] LLM Natural Language Understanding
- [ ] Structured Command Generation
- [ ] Command Validation
- [ ] LLM cannot directly control GPIO
- [ ] Network Failure Handling
- [ ] Invalid Command Rejection
- [ ] Secrets Protected
- [ ] Modular Code
- [ ] Extensible Architecture
- [ ] Full End-to-End Operation

---

# 22. Final Architecture

```text
                         USER
                           │
                           ↓
                    ┌─────────────┐
                    │     LLM     │
                    │ Natural Lang│
                    └──────┬──────┘
                           ↕
                    ┌─────────────┐
                    │     WEB     │
                    │  Dashboard  │
                    └──────┬──────┘
                           ↕
                    ┌─────────────┐
                    │  SUPABASE   │
                    │ Data+Command│
                    └──────┬──────┘
                           ↕
                          Wi-Fi
                           ↕
                    ┌─────────────┐
                    │    ESP32    │
                    │Main Controller│
                    └──┬────┬────┬┘
                       ↓    ↓    ↓
                    Sensor LED Servo
```

## Uplink

```text
Sensor
  ↓
ESP32
  ↓
Wi-Fi
  ↓
Supabase
  ↓
Web / LLM
```

## Downlink

```text
LLM / Web
  ↓
Supabase
  ↓
Wi-Fi
  ↓
ESP32
  ↓
LED / Servo
```

---

# 23. Project Definition

> **Project-IoT is an ESP32-based two-way IoT platform that reads physical sensor data, stores it in Supabase, provides monitoring and control through a Web Dashboard, and uses an LLM as a natural-language interface for validated commands that control physical devices such as LED and Servo Motor.**

---

# 24. AI Agent Starting Procedure

เมื่อ AI Agent เริ่มทำงาน:

```text
STEP 1
Clone / Open Repository

dduskxy/Project-IoT

↓

STEP 2
Inspect Repository

↓

STEP 3
Inspect Existing ESP32 Code

↓

STEP 4
Inspect Existing Web Code

↓

STEP 5
Inspect Supabase Configuration / Database

↓

STEP 6
Inspect Supabase through MCP when available

↓

STEP 7
Create Current-State Assessment

↓

STEP 8
Identify Missing Components

↓

STEP 9
Create Implementation Plan

↓

STEP 10
Implement Phase by Phase

↓

STEP 11
Test Each Phase

↓

STEP 12
Integrate Everything

↓

STEP 13
Review Security

↓

STEP 14
Update Documentation

↓

STEP 15
Run Final Tests

↓

STEP 16
Review Git Diff

↓

FINAL
Working IoT System
```

---

# 25. Core Concept

```text
ESP32
= Main Hardware Controller

Sensor
= Input

LED
= Output

Servo
= Output / Actuator

Wi-Fi
= Network Communication

Supabase
= Cloud Database + Command Layer

Web
= Monitoring + Control Interface

LLM
= Natural Language Interface
```

หัวใจของระบบ:

```text
SENSOR
   ↓
ESP32
   ↓
SUPABASE
   ↓
WEB / LLM
```

สำหรับการอ่านข้อมูล

และ:

```text
LLM / WEB
   ↓
SUPABASE
   ↓
ESP32
   ↓
LED / SERVO
```

สำหรับการควบคุม Hardware

---

# 26. Important Final Rule

README นี้กำหนด Architecture และ Intended Behavior ของโปรเจกต์

Implementation จริงต้องอ้างอิงจาก:
1. Existing Repository Code
2. Existing Supabase Project
3. Actual Hardware
4. Existing Configuration
5. Explicit Project Requirements

หากข้อมูลไม่สามารถตรวจสอบได้:

```text
DO NOT GUESS.
```

เป้าหมาย:

```text
Working
Maintainable
Secure
Testable
Modular
Extensible
```

ภายใน:

```text
dduskxy/Project-IoT
```
