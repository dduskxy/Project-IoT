import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, deviceId } = body;

    if (!message || !deviceId) {
      return NextResponse.json(
        { error: 'message and deviceId are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'ระบบ AI ยังไม่พร้อมใช้งาน กรุณาตั้งค่า GEMINI_API_KEY ในไฟล์ .env.local' },
        { status: 500 }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

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
    const aiResponse = result.response.text();

    let device = '';
    let command = '';
    let cleanReply = aiResponse;

    // Parse the hidden commands from Gemini's response
    if (aiResponse.includes('[CMD:LED_ON]')) {
      device = 'LED'; command = 'ON';
      cleanReply = cleanReply.replace('[CMD:LED_ON]', '');
    } else if (aiResponse.includes('[CMD:LED_OFF]')) {
      device = 'LED'; command = 'OFF';
      cleanReply = cleanReply.replace('[CMD:LED_OFF]', '');
    } else if (aiResponse.includes('[CMD:PUMP_ON]')) {
      device = 'PUMP'; command = 'ON';
      cleanReply = cleanReply.replace('[CMD:PUMP_ON]', '');
    } else if (aiResponse.includes('[CMD:PUMP_OFF]')) {
      device = 'PUMP'; command = 'OFF';
      cleanReply = cleanReply.replace('[CMD:PUMP_OFF]', '');
    }

    // Connect to Supabase
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let commandData = null;

    // If a hardware command was detected, insert it into Supabase
    if (device && command) {
      const { data, error } = await supabase
        .from('commands')
        .insert([
          {
            device_id: deviceId,
            device: device,
            command: command,
            value: null,
            status: 'PENDING'
          }
        ])
        .select()
        .single();

      if (error) {
        console.error('Error inserting command:', error);
        return NextResponse.json(
          { error: 'หนูติดต่อระบบรดน้ำไม่ได้ค่ะ แงงง' },
          { status: 500 }
        );
      }
      commandData = data;
    }

    return NextResponse.json({
      reply: cleanReply.trim(),
      command: commandData,
      success: true
    });

  } catch (err) {
    console.error('Error in chat API:', err);
    return NextResponse.json(
      { error: 'หนูคิดไม่ออกค่ะ (ระบบ AI ขัดข้อง)' },
      { status: 500 }
    );
  }
}
