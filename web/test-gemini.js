const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'web/.env.local' });

async function run() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const message = "เปิดไฟให้หน่อยครับ";
  const prompt = `
คุณคือ "ฟลอร่า (Flaura)" ต้นไม้ AI ที่มีชีวิต ร่าเริง น่ารัก ขี้อ้อน และรักเจ้าของมาก 
คุณอาศัยอยู่ในกระถางอัจฉริยะ คุณสามารถคุยเรื่องทั่วไป เรื่องอากาศ หรือเรื่องความรู้สึกได้

ผู้ใช้พูดกับคุณว่า: "${message}"

ให้คุณตอบกลับผู้ใช้เป็นภาษาไทย สั้นๆ น่ารักๆ และใช้ Emoji ประกอบ
แต่!! ถ้าผู้ใช้มีเจตนาสั่งให้คุณทำสิ่งต่อไปนี้ คุณ **ต้อง** แทรกรหัสคำสั่งลงไปในข้อความตอบกลับด้วย:
- ถ้าผู้ใช้สั่งให้ "เปิดไฟ" (หรือบ่นว่ามืด อยากได้แสง) -> แทรกคำว่า [CMD:LED_ON]
- ถ้าผู้ใช้สั่งให้ "ปิดไฟ" (หรือบ่นว่าสว่างไป จะนอนแล้ว) -> แทรกคำว่า [CMD:LED_OFF]
- ถ้าผู้ใช้สั่งให้ "รดน้ำ" หรือ "เปิดปั๊ม" (หรือคุณหิวน้ำ) -> แทรกคำว่า [CMD:PUMP_ON]
- ถ้าผู้ใช้สั่งให้ "หยุดรดน้ำ" หรือ "ปิดปั๊ม" -> แทรกคำว่า [CMD:PUMP_OFF]

ห้ามอธิบายรหัสคำสั่งให้ผู้ใช้ฟัง ให้เนียนตอบแบบน่ารักๆ แล้วซ่อนรหัสนั้นไว้ตรงไหนก็ได้ของประโยค
`;
  const result = await model.generateContent(prompt);
  console.log("RESPONSE:", result.response.text());
}
run();
