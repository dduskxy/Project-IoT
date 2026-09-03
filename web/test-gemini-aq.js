const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function run() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-8b' });
    const result = await model.generateContent("เปิดไฟให้หน่อยครับ");
    console.log("SUCCESS:", result.response.text());
  } catch (e) {
    console.error("ERROR:", e.message);
  }
}
run();
