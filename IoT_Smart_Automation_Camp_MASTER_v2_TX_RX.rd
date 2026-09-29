# IoT Smart Automation Camp — AGY CLI MASTER BUILD SPECIFICATION

Project Type:
Interactive educational web-slide platform for an IoT activity camp.

Primary Goal:
Build a complete working prototype that teaches absolute beginners how to understand IoT hardware, wiring, Arduino-style code, NRF24L01 communication concepts, sensors, troubleshooting, and a final integrated IoT challenge.

The website must NOT feel like a static documentation site.
It must feel like an interactive workshop/presentation where the student can:

LEARN → SEE → CONNECT → RUN → OBSERVE → FIX → COMPLETE MISSION

==================================================
0. IMPORTANT PROJECT RULES
==================================================

1. Build the project as a clean, maintainable, production-quality Next.js application.
2. The current NRF24L01 code provided below is an INITIAL teaching example only, NOT final production code.
3. Do not invent uncertain hardware pin mappings.
4. When hardware details are not verified, use placeholders and mark them clearly in source comments/data.
5. The hardware photo supplied with this task is the reference image for the physical board.
6. Design the architecture so more sensors and hardware can be added later without rewriting the application.
7. Phase 1 does not require real Arduino hardware communication.
8. Phase 1 does not require a backend, authentication, database, or external API.
9. Use realistic mock/simulation state so the entire prototype works immediately after installation.
10. Do not over-engineer the simulator. Prioritize usability for beginners.
11. All instructional text must be in Thai unless a technical identifier/code term is clearer in English.
12. Explain technical terms in simple language before expecting students to use them.
13. No excessive animations, gradients, glassmorphism, neon effects, or visual clutter.
14. The UI must be responsive for desktop and tablet and remain usable on smaller screens.
15. The student must always know:
    - where they are
    - what they are learning
    - what action they should perform
    - whether the action succeeded
    - what to do next

==================================================
1. RECOMMENDED TECH STACK
==================================================

Use:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Lucide Icons

Deployment target:
- Vercel

Use a clean component architecture.
Prefer reusable components over duplicated page-specific implementations.

Suggested structure:

/app
/components
/components/slides
/components/hardware
/components/simulation
/components/code
/components/mission
/components/quiz
/components/troubleshooting
/data
/types
/lib
/public
/docs

Keep content/data separate from UI whenever practical.

==================================================
2. VISUAL / UX DIRECTION
==================================================

Design language:

- modern
- clean
- technical but approachable
- educational
- polished
- minimal
- strong hierarchy
- beginner friendly

Preferred visual system:

- light background
- dark readable text
- restrained gray surfaces
- one controlled accent color
- rounded cards
- subtle shadows
- generous whitespace
- high-quality typography
- subtle micro-interactions

Avoid:

- excessive gradients
- dark "hacker" aesthetic
- neon
- excessive glass cards
- huge amounts of text
- dashboard-like complexity
- meaningless decorative animation
- emoji as UI decoration

Core rule:
ONE SCREEN = ONE CLEAR LEARNING OBJECTIVE.

==================================================
3. GLOBAL APP EXPERIENCE
==================================================

Create:

A. Landing page
B. Workshop presentation system
C. Progress tracking
D. Slide navigation
E. Mission system
F. Simulation tools
G. Quiz system
H. Troubleshooting
I. Final challenge

The experience should feel like a guided camp.

Suggested top-level navigation:

- Home
- Workshop
- Missions
- Hardware
- Progress

For Phase 1, all data may be local state.

==================================================
4. WORKSHOP SLIDE ENGINE
==================================================

Create a reusable SlideLayout component.

Every slide should support:

- slide number
- title
- short subtitle/description
- main learning area
- optional interactive area
- progress indicator
- previous button
- next button
- completion state

Keyboard controls:

ArrowLeft = previous
ArrowRight = next

Do not allow navigation UI to become confusing.

Suggested visual structure:

------------------------------------------------
IoT CAMP
Step 04 / 13

[ Title ]

[ Main visual / simulator ]

[ Simple explanation ]

[ Previous ]                  [ Next ]
------------------------------------------------

==================================================
5. WORKSHOP CONTENT MAP
==================================================

Create these initial lessons:

/workshop/01
Introduction

/workshop/02
Hardware

/workshop/03
IoT Architecture

/workshop/04
NRF24L01

/workshop/05
Wiring Simulator

/workshop/06
Code Lab

/workshop/07
Serial Monitor

/workshop/08
Mission

/workshop/09
Sensor Lab

/workshop/10
IoT Simulation

/workshop/11
Quiz

/workshop/12
Troubleshooting

/workshop/13
Final Challenge

==================================================
6. SLIDE 01 — WELCOME
==================================================

Title:
IoT Smart Automation Camp

Explain:

- IoT คืออะไร
- เราจะสร้างระบบแบบไหน
- วันนี้จะเรียนรู้จากของจริง + การจำลอง
- เส้นทางการเรียนรู้

Keep text short.

Primary CTA:
"เริ่มกิจกรรม"

==================================================
7. SLIDE 02 — HARDWARE
==================================================

The user supplied a real hardware image in this task.

Use the supplied image as the visual reference for the board.

The page should show the physical board image and create an interactive overlay system.

The student can hover/click relevant areas.

Required interactive categories:

- Digital pins
- Analog pins
- Power pins
- SPI
- NRF24L01 connection area

Each selected pin/area should show:

- ชื่อ
- หน้าที่
- ตัวอย่างการใช้งาน
- หมายเหตุ if uncertain

Do not fabricate pin mappings not confirmed by source material.

Where the exact board identity or exact pin mapping is not verified,
use a configurable data file and a "ข้อมูลนี้ต้องตรวจสอบกับบอร์ดจริง" note.

==================================================
8. SLIDE 03 — WHAT IS IoT?
==================================================

Create an animated conceptual system:

Sensor
↓
Controller
↓
Wireless
↓
Receiver
↓
Dashboard

Each node is clickable.

When clicked, show a beginner-friendly explanation.

Example:

Sensor:
"อุปกรณ์ที่ตรวจจับสิ่งต่าง ๆ เช่น อุณหภูมิ แสง หรือการเคลื่อนไหว"

Controller:
"สมองของระบบ ทำหน้าที่อ่านข้อมูลและสั่งงาน"

Wireless:
"การส่งข้อมูลโดยไม่ต้องใช้สายระหว่างอุปกรณ์"

==================================================
9. SLIDE 04 — NRF24L01
==================================================

Learning objective:

"ตรวจสอบว่า NRF24L01 เชื่อมต่อกับบอร์ดและตอบสนองหรือไม่"

Show conceptual wiring:

Controller
├── CE
├── CSN
└── SPI
       ↓
    NRF24L01

The actual pin details shown in this lesson must be based on verified project data.

==================================================
10. INITIAL NRF24L01 TEACHING CODE
==================================================

Use this exact initial example:

#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>
#include <printf.h>

#define CE_PIN   9
#define CSN_PIN  10

RF24 radio(CE_PIN, CSN_PIN);

void setup() {
  Serial.begin(115200);
  while (!Serial) {}

  printf_begin();

  Serial.println(F("Testing NRF24L01 connection..."));

  if (!radio.begin()) {
    Serial.println(F("ERROR: NRF24L01 hardware not responding!"));
    while (1) {}
  }

  Serial.println(F("SUCCESS: NRF24L01 found!"));
  radio.printPrettyDetails();
}

void loop() {}

IMPORTANT:
Treat this as a teaching example and prototype code.
Do not claim it is complete NRF24L01 communication code.

==================================================
11. CODE EXPLORER
==================================================

Create an interactive code teaching interface.

Do not force beginners to read the entire file at once.

Split the code into sections:

1. Libraries
2. Pin definitions
3. RF24 object
4. setup()
5. Serial communication
6. radio.begin()
7. success/error logic
8. loop()

Interaction behavior:

When the student selects a section:

- highlight the relevant code
- show one simple explanation
- optionally show a diagram
- explain what changes when the line executes

Example:

Code:
#define CE_PIN 9

Explanation:
"กำหนดให้ CE ใช้ขา Digital 9 ในตัวอย่างนี้"

For:
if (!radio.begin())

Show visual logic:

radio.begin()
      |
  ┌───┴────┐
  |        |
พบอุปกรณ์  ไม่พบ
  |        |
SUCCESS    ERROR

==================================================
12. WIRING SIMULATOR
==================================================

Build a beginner-friendly 2D wiring simulator.

Core objects:

- controller board
- NRF24L01 module
- pin labels
- wires

Allow the student to drag/connect wires.

The simulator should check:

- correct connection
- incorrect connection
- missing connection

Correct state:
- visual success
- concise explanation

Incorrect state:
- visual error
- hint
- identify the problematic connection

Do NOT attempt to simulate electronics electrically in Phase 1.

Use logical connection rules.

Create a data-driven connection definition such as:

{
  source: "...",
  target: "...",
  required: true
}

The simulator must be extensible so future sensors can use the same engine.

==================================================
13. CODE LAB
==================================================

Create an interactive code practice area.

Layout:

LEFT:
Code editor / code viewer

RIGHT:
Simulation controls + Serial Monitor

Controls:

- Run
- Stop
- Reset
- Clear output

Phase 1 behavior:

Do NOT compile real Arduino code in the browser.

Instead, create a deterministic simulation engine.

The engine should inspect the mock lesson state and generate educational output.

Example successful simulation:

Testing NRF24L01 connection...

SUCCESS: NRF24L01 found!

Example failure simulation:

Testing NRF24L01 connection...

ERROR: NRF24L01 hardware not responding!

The code editor can support controlled edits to the relevant teaching values such as:

CE_PIN
CSN_PIN

The simulator should provide useful hints when the simulated configuration is wrong.

==================================================
14. SERIAL MONITOR
==================================================

Create a Serial Monitor UI inspired by a real developer tool.

Features:

- Baud rate display
- Run
- Stop
- Clear
- Scrollable output
- timestamp toggle optional
- status indicator

Initial teaching states:

STATE_CONNECTED:
Testing NRF24L01 connection...
SUCCESS: NRF24L01 found!

STATE_DISCONNECTED:
Testing NRF24L01 connection...
ERROR: NRF24L01 hardware not responding!

Use monospace text.

==================================================
15. MISSION SYSTEM
==================================================

Create a reusable mission component.

Mission data structure should support:

- id
- title
- description
- steps
- hints
- completion conditions
- progress
- completed

Initial mission:

Mission 01:
ตรวจสอบ NRF24L01 Connection

Checklist:

[ ] ตรวจสอบ CE
[ ] ตรวจสอบ CSN
[ ] ตรวจสอบ SPI
[ ] Run Code
[ ] พบ NRF24L01

When all required conditions are satisfied:

- show completion state
- record mission completion locally
- unlock the next mission

Do not require a backend in Phase 1.

==================================================
16. SLIDE 09 — SENSOR LAB
==================================================

Create a scalable Sensor Library.

Future hardware examples:

- DHT22
- BME280
- LDR
- PIR
- Ultrasonic
- Relay

Phase 1:
Do NOT pretend the sensors are physically connected.

Create placeholder/mock lessons.

Each sensor card should support:

- name
- image/illustration placeholder
- what it detects
- wiring
- example code
- output
- common mistakes
- mission

Make adding a new sensor data-driven.

==================================================
17. SLIDE 10 — FULL IoT SIMULATION
==================================================

Create a clean animated system model:

Sensor
↓
Controller
↓
NRF24L01
~~~ wireless ~~~
Receiver
↓
Dashboard

Animate a data packet moving through the system.

Allow clicking each node.

When a node is clicked, explain:

- what it does
- what data enters
- what data leaves
- why it exists

Keep the animation simple and educational.

==================================================
18. SLIDE 11 — QUIZ
==================================================

Create a reusable multiple-choice quiz component.

Support:

- question
- choices
- selected answer
- correct/incorrect state
- explanation after answer
- score

Do not reveal the answer before the learner selects an option.

Initial examples:

Question:
"CE_PIN ในตัวอย่างนี้มีค่าเท่าไร?"

Options:
A. 8
B. 9
C. 10
D. 11

Correct answer:
B

Explanation:
"ในตัวอย่างกำหนด #define CE_PIN 9"

Add additional questions covering:

- purpose of Sensor
- controller role
- wireless concept
- CE/CSN concept
- Serial Monitor
- troubleshooting

==================================================
19. SLIDE 12 — TROUBLESHOOTING
==================================================

Create an interactive troubleshooting tree.

Main problem:
"NRF24L01 ไม่ตอบสนอง"

Tree:

ตรวจ Power
↓
ตรวจ GND
↓
ตรวจ CE
↓
ตรวจ CSN
↓
ตรวจ SPI
↓
ตรวจ Library
↓
ทดลอง Run ใหม่

Each step should have:

- what to check
- why it matters
- success/failure branch
- hint

The UI should feel like a guided diagnostic wizard rather than a long article.

==================================================
20. SLIDE 13 — FINAL CHALLENGE
==================================================

Final mission:

"สร้างระบบ IoT ที่อ่าน Sensor และส่งข้อมูลแบบไร้สาย"

Show modular building blocks:

Sensor
+
Controller
+
NRF24L01
+
Receiver
+
Dashboard

Final checklist example:

[ ] เลือก Sensor
[ ] ต่อ Sensor
[ ] ต่อ NRF24L01
[ ] ตรวจ Pin
[ ] Run Code
[ ] ตรวจ Serial Monitor
[ ] ส่งข้อมูลสำเร็จ

Phase 1:
Use simulation only.

==================================================
21. PROGRESS SYSTEM
==================================================

Create local progress state.

Track:

- viewed slides
- completed lessons
- completed missions
- quiz score
- final challenge state

Show a simple progress indicator.

Example:

กิจกรรมสำเร็จแล้ว 6 / 13

Persist using localStorage.

Create a reset progress action for instructors.

==================================================
22. DATA-DRIVEN CONTENT
==================================================

Do not hard-code all lesson content into page components.

Create structured data files.

Suggested:

/data/workshop.ts
/data/hardware.ts
/data/missions.ts
/data/quizzes.ts
/data/sensors.ts
/data/troubleshooting.ts

Create TypeScript types for each data group.

This allows instructors to modify the camp content without rewriting UI components.

==================================================
23. ACCESSIBILITY
==================================================

Implement:

- readable contrast
- keyboard navigation
- visible focus states
- semantic buttons
- aria labels for interactive hardware regions
- no essential information conveyed by color alone
- responsive text sizing

==================================================
24. PERFORMANCE
==================================================

Keep animations lightweight.

Do not load unnecessary large 3D assets.

Prefer SVG/CSS for diagrams and animation.

Use optimized images.

Lazy-load large non-critical media.

==================================================
25. ERROR / EMPTY STATES
==================================================

Every interactive component must have a useful state for:

- not started
- in progress
- success
- error
- reset

Do not show generic "Something went wrong" when a specific educational hint can be shown.

==================================================
26. INSTRUCTOR-FRIENDLY CONTENT MODEL
==================================================

Create a CONTENT.md file explaining how to modify:

- slide titles
- descriptions
- hardware definitions
- sensor definitions
- mission rules
- quiz questions
- troubleshooting steps

Also create README.md with:

- project purpose
- setup
- development commands
- architecture
- deployment
- how to add a sensor
- how to add a lesson
- how to modify simulation rules

==================================================
27. FUTURE EXTENSIBILITY
==================================================

Prepare architecture for future phases:

PHASE 2:
- Supabase
- authentication
- student accounts
- instructor dashboard
- real-time progress
- shared classroom checklist

PHASE 3:
- real ESP32 / Arduino integration
- live sensor data
- real device commands

PHASE 4:
- advanced simulations
- optional 3D hardware view
- classroom multiplayer activities

Do NOT implement these future phases now.

Only create clean extension points.

==================================================
28. IMAGE / HARDWARE ASSET HANDLING
==================================================

The physical hardware image supplied with this task should be used as the reference for the hardware lesson.

Do not distort or relabel the image inaccurately.

Create an asset slot/configuration so the image can later be replaced with a higher-resolution original.

The application should use a dedicated data structure for image source and board metadata.

==================================================
29. PROJECT QUALITY STANDARD
==================================================

Before finishing:

1. Ensure TypeScript has no avoidable errors.
2. Ensure all pages render.
3. Ensure navigation works.
4. Ensure keyboard navigation works.
5. Ensure Wiring Simulator works.
6. Ensure Code Lab simulation works.
7. Ensure Serial Monitor works.
8. Ensure Mission completion works.
9. Ensure Quiz works.
10. Ensure Troubleshooting works.
11. Ensure IoT animation works.
12. Ensure progress persists.
13. Ensure mobile/tablet layout is usable.
14. Ensure there are no broken internal links.
15. Ensure components are reusable.
16. Ensure mock data is clearly separated from future real integrations.

==================================================
30. AGY CLI EXECUTION STRATEGY
==================================================

AGY CLI should manage the project end-to-end.

Execution order:

PHASE A — PROJECT FOUNDATION
- initialize Next.js + TypeScript
- install UI/animation dependencies
- configure Tailwind
- configure shadcn/ui
- create base layout
- create design tokens
- create component directories

PHASE B — CORE SLIDE ENGINE
- SlideLayout
- navigation
- progress
- keyboard control
- lesson routing
- local progress state

PHASE C — HARDWARE EXPERIENCE
- reference image
- interactive overlays
- pin tooltips
- hardware data model

PHASE D — NRF24 LESSON
- code viewer
- code explanations
- logic diagram
- simulator

PHASE E — WIRING
- wiring canvas
- connection rules
- validation
- hints

PHASE F — SERIAL / CODE LAB
- code editor
- simulation engine
- Serial Monitor
- success/failure states

PHASE G — MISSIONS
- mission model
- checklist
- local persistence
- unlock logic

PHASE H — SENSOR ARCHITECTURE
- sensor library
- mock lessons
- reusable sensor cards

PHASE I — IoT SIMULATION
- animated nodes
- animated data packets
- explanations

PHASE J — QUIZ / TROUBLESHOOTING
- quiz engine
- troubleshooting tree

PHASE K — FINAL CHALLENGE
- modular final challenge
- completion state

PHASE L — DOCUMENTATION / QA
- README.md
- CONTENT.md
- test all routes
- fix UI bugs
- verify responsive behavior

==================================================
31. ACCEPTANCE CRITERIA
==================================================

The prototype is considered complete only when a complete beginner can:

1. Enter the website.
2. Understand what IoT is.
3. Identify major hardware categories.
4. Understand the role of NRF24L01.
5. Follow the beginner explanation of the sample code.
6. Simulate wiring.
7. Make an intentional wiring mistake.
8. Receive a useful hint.
9. Run the simulation.
10. See Serial Monitor output.
11. Complete Mission 01.
12. Explore a mock sensor lesson.
13. Watch the IoT data-flow simulation.
14. answer a quiz.
15. troubleshoot a simulated NRF24L01 problem.
16. complete the final simulated challenge.

==================================================
32. IMPORTANT CONTENT PRINCIPLES
==================================================

Never assume the student knows:

- voltage
- current
- GPIO
- SPI
- CE
- CSN
- library
- object
- function
- baud rate
- serial communication
- wireless protocol

Explain a term before relying on it.

Use the pattern:

TERM
↓
WHAT IT MEANS
↓
WHY WE USE IT
↓
WHAT THE STUDENT SHOULD DO

Do not overload one slide with too many concepts.

==================================================
33. FINAL BUILD INSTRUCTION
==================================================

Build the complete Phase 1 working prototype from this specification.

Do not stop at a static mockup.

All core interactions listed in the specification must function locally.

Where real hardware integration is intentionally unavailable, simulate it transparently.

Do not invent uncertain hardware facts.

When a fact cannot be verified from the supplied project information, expose it as configurable data / placeholder instead of presenting it as certain.

The finished result should be a polished, beginner-first IoT workshop platform that can later evolve into a real classroom system connected to Supabase and physical devices.

END OF MASTER SPECIFICATION


==================================================
34. LATEST VERIFIED WORKSHOP HARDWARE / WIRING
==================================================

The latest instructor-supplied workshop material defines the current
NRF24L01 + Arduino UNO teaching configuration.

CURRENT Arduino UNO SPI:
- SCK  = D13
- MOSI = D11
- MISO = D12

CURRENT code control pins:
- CE  = D9
- CSN = D10

Power:
- NRF24L01 VCC = 3.3V
- NRF24L01 GND = GND

Teach this current configuration first.
Do not silently replace CE/CSN with other pins.

The latest supplied wiring diagram is the visual reference.

==================================================
35. CORE PRACTICAL ACTIVITY — TWO BOARD NRF24L01
==================================================

The workshop now centers on TWO Arduino UNO boards:

BOARD A = TRANSMITTER / TX
BOARD B = RECEIVER / RX

Each board has its own NRF24L01 module.

Learning sequence:

1. Identify NRF24L01 pins.
2. Wire the TX board.
3. Wire the RX board.
4. Upload TX code.
5. Upload RX code.
6. Open both Serial Monitors.
7. Observe TX sending data.
8. Observe RX receiving data.
9. Understand matching address.
10. Understand successful transmission / ACK result.
11. Intentionally create failures.
12. Troubleshoot.
13. Complete the final communication challenge.

==================================================
36. CURRENT WIRING TABLE
==================================================

Display clearly in the Hardware and Wiring lessons.

NRF24L01 → Arduino UNO

SCK  → D13
MOSI → D11
MISO → D12
CE   → D9
CSN  → D10
VCC  → 3.3V
GND  → GND

Create a role toggle:

[ TRANSMITTER ]
[ RECEIVER ]

Both roles use the same current physical pin wiring.
The TX/RX difference is primarily established by the program.

Do not imply that TX Arduino and RX Arduino have their SPI pins wired
directly to each other. Each NRF24L01 connects locally to its own Arduino.

==================================================
37. CURRENT TX / TRANSMITTER CODE
==================================================

Use this exact instructor-supplied code in the TX lesson:

#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

#define CE_PIN   9
#define CSN_PIN  10

RF24 radio(CE_PIN, CSN_PIN);

// Address ความยาว 5 ไบต์ (ต้องตรงกันทั้งตัวส่งและตัวรับ)
const byte address[6] = "00001";
int counter = 0;

void setup() {
  Serial.begin(115200);
  while (!Serial) {}

  if (!radio.begin()) {
    Serial.println(F("NRF24 Not Found! Check wiring"));
    while (1);
  }

  radio.openWritingPipe(address);
  radio.setPALevel(RF24_PA_LOW); // ใช้กำลังส่งต่ำเพื่อความเสถียรและประหยัดไฟ
  radio.stopListening();          // กำหนดให้เป็นตัวส่ง
  Serial.println(F("TX Ready! Starting transmission..."));
}

void loop() {
  Serial.print(F("Sending count: "));
  Serial.println(counter);

  bool report = radio.write(&counter, sizeof(counter));

  if (report) {
    Serial.println(F(" -> Transmission successful!"));
  } else {
    Serial.println(F(" -> Delivery failed (No ACK)"));
  }

  counter++;
  delay(1000); // ส่งทุกๆ 1 วินาที
}

==================================================
38. CURRENT RX / RECEIVER CODE
==================================================

Use this exact instructor-supplied code in the RX lesson:

#include <SPI.h>
#include <nRF24L01.h>
#include <RF24.h>

#define CE_PIN   9
#define CSN_PIN  10

RF24 radio(CE_PIN, CSN_PIN);

const byte address[6] = "00001";

void setup() {
  Serial.begin(115200);
  while (!Serial) {}

  if (!radio.begin()) {
    Serial.println(F("NRF24 Not Found! Check wiring"));
    while (1);
  }

  radio.openReadingPipe(0, address);
  radio.setPALevel(RF24_PA_LOW);
  radio.startListening(); // สั่งให้เริ่มรอรับสัญญาณ
  Serial.println(F("RX Ready! Waiting for data..."));
}

void loop() {
  if (radio.available()) {
    int receivedData = 0;
    radio.read(&receivedData, sizeof(receivedData));

    Serial.print(F("Received message: "));
    Serial.println(receivedData);
  }
}

==================================================
39. TEACH TX AND RX SEPARATELY
==================================================

Do not put both full programs into one dense lesson.

TX focus:
- openWritingPipe(address)
- stopListening()
- radio.write()
- counter
- report
- transmission result

RX focus:
- openReadingPipe(0, address)
- startListening()
- radio.available()
- radio.read()
- receivedData

Show a visual flow:

TX:
counter
  ↓
radio.write()
  ↓
NRF24 )))))
  ↓
wireless
  ↓
NRF24
  ↓
radio.available()
  ↓
radio.read()
  ↓
receivedData

==================================================
40. ADDRESS LESSON
==================================================

Current code:

const byte address[6] = "00001";

Explain to beginners:

"Address คือค่าที่ใช้ระบุปลายทางของการสื่อสารในตัวอย่างนี้
ฝั่ง TX และ RX ต้องกำหนดค่าให้ตรงกัน"

Create interactive demo:

TX address: 00001
RX address: 00001

→ ✓ Address matches

Failure example:

TX address: 00001
RX address: 12345

→ ✕ Address does not match

Then show a hint:
"ลองตรวจค่า address ของทั้งสองฝั่ง"

==================================================
41. DUAL SERIAL MONITOR
==================================================

Create two Serial Monitor panels at the same time.

LEFT:
TX Serial Monitor

RIGHT:
RX Serial Monitor

TX sample:

TX Ready! Starting transmission...
Sending count: 0
 -> Transmission successful!
Sending count: 1
 -> Transmission successful!
Sending count: 2
 -> Transmission successful!

RX sample:

RX Ready! Waiting for data...
Received message: 0
Received message: 1
Received message: 2

Failure example:

TX:
Sending count: 0
 -> Delivery failed (No ACK)

RX:
RX Ready! Waiting for data...

Connect the two monitors visually with a small wireless animation.

==================================================
42. LIVE DATA PACKET VISUALIZATION
==================================================

Show:

TX COUNTER
Current value: 12

        ↓

[ DATA PACKET: 12 ]

        ~~~~~ wireless ~~~~~>

RX DATA
Received value: 12

When the TX counter increments, the simulated packet and RX display
should update.

This is a teaching visualization, not a real radio protocol emulator.

==================================================
43. ACK / DELIVERY EXPLANATION
==================================================

The TX code uses:

bool report = radio.write(&counter, sizeof(counter));

Beginner explanation:

"คำสั่งส่งข้อมูลจะคืนค่าให้โปรแกรมเพื่อใช้ตรวจผลการส่ง
ในตัวอย่างนี้จะแสดงเป็น Transmission successful หรือ Delivery failed"

Show simple visual:

TX
 ↓
Send
 ↓
Receiver response
 ↓
ACK
 ↓
TX receives success result

Failure simulation:

TX
 ↓
Send
 ↓
No successful response
 ↓
Delivery failed (No ACK)

Do not imply that "No ACK" has only one possible physical cause.
Several wiring/configuration/runtime conditions can lead to failure.

==================================================
44. UPDATED MISSION SYSTEM
==================================================

Mission 01:
ตรวจสอบการต่อ NRF24L01

Checklist:
[ ] CE = D9
[ ] CSN = D10
[ ] SCK = D13
[ ] MOSI = D11
[ ] MISO = D12
[ ] VCC = 3.3V
[ ] GND = GND

Mission 02:
ทำให้ TX พร้อมใช้งาน

[ ] Upload TX code
[ ] Serial = 115200
[ ] พบ "TX Ready!"
[ ] พบ "Sending count"

Mission 03:
ทำให้ RX พร้อมใช้งาน

[ ] Upload RX code
[ ] Serial = 115200
[ ] พบ "RX Ready!"
[ ] RX รอรับข้อมูล

Mission 04:
ทำให้ TX และ RX สื่อสารกัน

[ ] TX ส่ง count
[ ] TX แสดง Transmission successful!
[ ] RX แสดง Received message
[ ] ค่า received ตรงกับค่าที่ส่ง

Mission 05:
ทดลองสร้างปัญหาแล้วแก้

[ ] เปลี่ยน address ฝั่งหนึ่ง
[ ] สังเกตการส่งไม่สำเร็จ
[ ] ตรวจพบสาเหตุ
[ ] คืน address ให้ตรงกัน
[ ] ทดสอบจนส่งสำเร็จ

==================================================
45. TWO-BOARD WIRING SIMULATOR
==================================================

Extend WiringSimulator to two-board mode.

TX SIDE:

Arduino UNO
  D13 → SCK
  D11 → MOSI
  D12 → MISO
  D9  → CE
  D10 → CSN
  3.3V → VCC
  GND → GND

RX SIDE:

Arduino UNO
  D13 → SCK
  D11 → MOSI
  D12 → MISO
  D9  → CE
  D10 → CSN
  3.3V → VCC
  GND → GND

Wireless link:

TX NRF24 )))))) RX NRF24

Important:
SPI lines are local connections from each Arduino to its own NRF24L01.
Do not draw a direct SPI cable between the two Arduino boards.

==================================================
46. TX/RX CODE COMPARISON
==================================================

Create side-by-side comparison.

TX highlighted:

radio.openWritingPipe(address);
radio.stopListening();
radio.write(...);

RX highlighted:

radio.openReadingPipe(0, address);
radio.startListening();
radio.available();
radio.read(...);

Simple summary:

TX = ส่งข้อมูล
RX = รอรับข้อมูล

Each line should be clickable and show a beginner explanation.

==================================================
47. BEGINNER CODE EXPLANATIONS
==================================================

For:

radio.openWritingPipe(address)

Explain:
"กำหนดค่า address ที่ฝั่งส่งจะใช้ส่งข้อมูล"

For:

radio.openReadingPipe(0, address)

Explain:
"กำหนด pipe สำหรับรับข้อมูล โดยใช้ address เดียวกับกิจกรรมนี้"

For:

radio.stopListening()

Explain:
"ตั้งโมดูลให้ทำหน้าที่ส่งข้อมูล"

For:

radio.startListening()

Explain:
"ตั้งโมดูลให้รอรับข้อมูล"

For:

radio.available()

Explain:
"ตรวจว่ามีข้อมูลเข้ามาให้เราอ่านหรือยัง"

For:

radio.write()

Explain:
"ส่งข้อมูลผ่าน NRF24L01"

For:

radio.read()

Explain:
"อ่านข้อมูลที่ได้รับ"

For:

setPALevel(RF24_PA_LOW)

Explain:
"ตั้งระดับกำลังส่งเป็นระดับต่ำตามตัวอย่างกิจกรรม"

Keep explanations beginner friendly.
Do not turn one line into a long theoretical lecture.

==================================================
48. UPDATED TROUBLESHOOTING WIZARD
==================================================

Main problem:
"TX ส่งไม่สำเร็จ / RX ไม่ได้รับข้อมูล"

Step 1:
NRF24 ถูกตรวจพบหรือไม่?

If NO:
Check:
- VCC
- GND
- CE
- CSN
- SPI

Step 2:
CE / CSN ตรงกับโค้ดหรือไม่?

Current expected:
CE = D9
CSN = D10

Step 3:
SPI ตรงหรือไม่?

Current Arduino UNO mapping:
SCK = D13
MOSI = D11
MISO = D12

Step 4:
TX และ RX ใช้ address เดียวกันหรือไม่?

Current expected:
00001

Step 5:
TX ใช้ stopListening() หรือไม่?

Step 6:
RX ใช้ startListening() หรือไม่?

Step 7:
RX มี radio.available() หรือไม่?

Step 8:
TX รายงาน Transmission successful! หรือไม่?

If Delivery failed (No ACK):
Guide the learner through wiring, address, receiver state and other
relevant configuration checks rather than claiming one guaranteed cause.

==================================================
49. FAILURE SCENARIO SIMULATOR
==================================================

Provide selectable simulated problems:

A. Wrong CE
B. Wrong CSN
C. Wrong SPI
D. Wrong address
E. RX not listening
F. RX disconnected
G. TX disconnected

Each scenario must show:

- realistic symptom
- concise hint
- optional "Show hint"
- optional "Show solution"
- reset

Do not immediately expose the answer before the learner attempts diagnosis.

==================================================
50. UPDATED WORKSHOP FLOW
==================================================

Use this preferred structure:

01 Welcome
02 What is IoT?
03 Know the hardware
04 NRF24L01 pinout
05 Wire one NRF24L01
06 Understand TX vs RX
07 Wire two boards
08 TX Code Lab
09 RX Code Lab
10 TX + RX Serial Monitor
11 Wireless Data Simulation
12 Missions
13 Troubleshooting
14 Quiz
15 Final Challenge

==================================================
51. FINAL CHALLENGE — CURRENT VERSION
==================================================

Challenge:
"ทำระบบส่งตัวเลขจาก Arduino UNO ฝั่งส่ง
ไปยัง Arduino UNO ฝั่งรับด้วย NRF24L01"

Success conditions:

[ ] TX wiring correct
[ ] RX wiring correct
[ ] TX code configured
[ ] RX code configured
[ ] Same address
[ ] TX enters sending mode
[ ] RX enters listening mode
[ ] TX reports successful transmission
[ ] RX receives data
[ ] Received value matches sent value

Success visualization:

TX Arduino
   ↓
TX NRF24L01
   )))))) wireless ))))))
RX NRF24L01
   ↓
RX Arduino
   ↓
RX Serial Monitor

==================================================
52. INSTRUCTOR MODE PREPARATION
==================================================

Prepare a future local Instructor Mode toggle.

Potential controls:

- reset all progress
- select failure scenario
- force wrong wiring
- force wrong address
- force communication failure
- reveal hints
- reveal solution
- inspect progress

Do not add authentication/backend in Phase 1.

==================================================
53. DATA MODEL UPDATE
==================================================

Prepare data types/concepts for:

Board
Nrf24Module
PinMapping
WiringConnection
RadioNode
RadioRole
RadioConfig
TransmissionPacket
SerialEvent
Mission
QuizQuestion
TroubleshootingScenario

Conceptual example:

RadioRole:
"TX" | "RX"

TransmissionPacket:
{
  value: number,
  address: string,
  delivered: boolean
}

Preserve the concepts even if final type names are improved.

==================================================
54. FACTUALITY / CONTENT RULE
==================================================

Separate:

A. Instructor-supplied current workshop configuration
from
B. General NRF24L01 theory.

The current workshop configuration is:

Arduino UNO:
SCK  = D13
MOSI = D11
MISO = D12
CE   = D9
CSN  = D10
VCC  = 3.3V
GND  = GND

TX/RX code uses:
address = "00001"
PA level = RF24_PA_LOW
TX = stopListening()
RX = startListening()

Do not expand uncertain hardware claims beyond the information available.
Keep configurable fields editable.

==================================================
55. FINAL AGY CLI UPDATE INSTRUCTION
==================================================

Merge this specification into the existing project plan.

The NRF24L01 two-board TX/RX activity is now the central practical lesson,
not a future placeholder.

Implementation priority:

1. Current instructor wiring
2. Current TX code
3. Current RX code
4. Beginner code explanation
5. Two-board Wiring Simulator
6. Dual Serial Monitor
7. Address simulation
8. Data packet animation
9. TX/RX Mission system
10. Failure scenarios
11. Troubleshooting
12. Quiz
13. Final Challenge

Do not stop at a visual mockup.
Implement the interactive behavior with local mock state.

END OF CURRENT WORKSHOP UPDATE
