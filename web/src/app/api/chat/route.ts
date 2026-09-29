import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, deviceId, sensorData } = body;

    if (!message || !deviceId) {
      return NextResponse.json(
        { error: 'message and deviceId are required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'เกิดข้อผิดพลาด: ไม่พบกุญแจ GEMINI_API_KEY ในระบบ' },
        { status: 500 }
      );
    }

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Define a strict JSON schema for world-class reliable hardware commands
    const responseSchema = {
      type: SchemaType.OBJECT,
      properties: {
        reply: {
          type: SchemaType.STRING,
          description: "คำตอบของระบบ ตอบกลับผู้ใช้เป็นภาษาไทยอย่างเป็นทางการ กระชับ เป็นระบบ และไม่มีอารมณ์ความรู้สึกเข้ามาเกี่ยวข้อง",
        },
        device: {
          type: SchemaType.STRING,
          description: "ถ้าผู้ใช้ต้องการสั่งงานฮาร์ดแวร์ ให้ระบุอุปกรณ์ ('BUZZER' สำหรับเสียงเตือน) ถ้าเป็นการสอบถามข้อมูลทั่วไปให้ปล่อยเป็นสตริงว่าง ''",
        },
        command: {
          type: SchemaType.STRING,
          description: "คำสั่งที่ต้องการส่ง ('ON' เพื่อเปิด, 'OFF' เพื่อปิด) ถ้าเป็นการสอบถามข้อมูลทั่วไปให้ปล่อยเป็นสตริงว่าง ''",
        }
      },
      required: ["reply", "device", "command"],
    };

    const prompt = `
คุณคือระบบ AI วิเคราะห์สภาพแวดล้อมการนอนหลับ (Smart Sleep Monitor System) รุ่นต้นแบบ
หน้าที่ของคุณคือรับคำสั่ง จัดการอุปกรณ์เตือน (Buzzer) วิเคราะห์ข้อมูลอุณหภูมิ และแสง เพื่อสรุปความเหมาะสมของห้องนอน
รูปแบบการสื่อสารของคุณคือ แชทบอทที่เป็นทางการ เป็นระบบ กระชับ ตรงไปตรงมา อธิบายจากข้อมูล ไม่เคลมว่าเป็นเครื่องมือแพทย์

คำเตือน: โปรเจกต์นี้ไม่มีเซนเซอร์วัดการเคลื่อนไหว (Accelerometer) อีกต่อไป ถ้าผู้ใช้ถามถึงการเคลื่อนไหวหรือการขยับตัวตอนนอน ให้ตอบไปตามตรงว่าระบบไม่มีข้อมูลส่วนนี้

ข้อมูลเซนเซอร์ล่าสุด (ใช้อ้างอิงการตอบคำถาม):
${JSON.stringify(sensorData || { error: 'ยังไม่มีข้อมูล' })}

ผู้ใช้ป้อนคำสั่งหรือข้อความว่า: "${message}"

Please respond in JSON format. ให้คุณตอบกลับมาในรูปแบบ JSON (Object) เท่านั้น โดยมีโครงสร้างดังนี้:
{
  "reply": "คำตอบภาษาไทยที่เป็นทางการ อธิบายจากข้อมูลที่วัดได้ กระชับ ตรงไปตรงมา ไม่ใส่อารมณ์ และไม่มี Emoji",
  "device": "ถ้าผู้ใช้สั่งงานฮาร์ดแวร์ให้ใส่ 'BUZZER' (สำหรับเสียงเตือน) ถ้าแค่สอบถามทั่วไปให้ใส่สตริงว่าง ''",
  "command": "คำสั่งฮาร์ดแวร์ 'ON' หรือ 'OFF' ถ้าแค่สอบถามทั่วไปให้ใส่สตริงว่าง ''"
}
`;

    let aiResponse = "";
    let lastError = null;
    const groqKey = process.env.GROQ_API_KEY;

    if (groqKey) {
      try {
        console.log("Using Groq (Llama 3 / Qwen)...");
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${groqKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "llama3-8b-8192", 
            messages: [{ role: "system", content: prompt }],
            response_format: { type: "json_object" },
            temperature: 0.7
          })
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Groq API Error: ${res.status} ${errText}`);
        }
        const groqData = await res.json();
        aiResponse = groqData.choices[0].message.content;
        console.log("Groq Success!");
      } catch (err: any) {
        console.warn("Groq failed, falling back to Gemini...", err.message);
        lastError = err;
      }
    }

    // Automatic Hub: Fallback to Gemini if Groq is not configured or fails
    if (!aiResponse) {
      const modelsToTry = [
        'gemini-3.7-flash', 
        'gemini-flash-latest', 
        'gemini-3.5-flash', 
        'gemini-3.6-flash',
        'gemini-1.5-flash'
      ];

      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ 
            model: modelName, 
            generationConfig: {
              responseMimeType: "application/json",
              responseSchema: responseSchema as any,
            }
          });
          
          console.log(`Trying Gemini model: ${modelName}...`);
          const result = await model.generateContent(prompt);
          aiResponse = result.response.text();
          console.log(`Success with Gemini model: ${modelName}`);
          break;
        } catch (err: any) {
          console.warn(`Gemini Model ${modelName} failed:`, err.message);
          lastError = err;
        }
      }
    }

    if (!aiResponse) {
      throw new Error(`All AI Models are currently busy. Last error: ${lastError?.message}`);
    }
    
    // Parse the strict JSON output
    let parsedResult;
    try {
      parsedResult = JSON.parse(aiResponse);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini", e);
      throw new Error("Invalid AI output format");
    }

    const { reply, device, command } = parsedResult;

    // Connect to Supabase
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    let commandData = null;

    // If a hardware command was explicitly generated by AI, save it to Supabase
    if (device === 'BUZZER' && command) {
      const { data, error } = await supabase
        .from('device_status')
        .upsert({
          device_id: deviceId,
          buzzer_status: command.toUpperCase()
        }, { onConflict: 'device_id' })
        .select()
        .single();

      if (error) {
        console.error('Error updating buzzer:', error);
        return NextResponse.json(
          { error: 'เกิดปัญหาขัดข้องในการสื่อสารกับฮาร์ดแวร์ ไม่สามารถส่งคำสั่งได้ในขณะนี้' },
          { status: 500 }
        );
      }
      commandData = data;
    }

    return NextResponse.json({
      reply: reply.trim(),
      command: commandData,
      success: true
    });

  } catch (err: any) {
    console.error('Error in chat API:', err);
    return NextResponse.json(
      { error: err.message || 'ระบบ AI ขัดข้อง ไม่สามารถประมวลผลคำสั่งได้ในขณะนี้' },
      { status: 500 }
    );
  }
}
