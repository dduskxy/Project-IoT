import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

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

    // AI Command Parsing Logic
    // In a real scenario, this would call an LLM (e.g. OpenAI) to extract intent.
    // For this prototype, we provide a keyword-based NLP mock implementation.
    let device = '';
    let command = '';
    let value: number | null = null;

    const lowerMessage = message.toLowerCase();

    // Mock NLP extraction with Plant Persona
    if (lowerMessage.includes('เปิดปั๊ม') || lowerMessage.includes('รดน้ำ') || lowerMessage.includes('หิวน้ำ')) {
      device = 'PUMP';
      command = 'ON';
    } else if (lowerMessage.includes('ปิดปั๊ม') || lowerMessage.includes('หยุดรดน้ำ') || lowerMessage.includes('อิ่มแล้ว')) {
      device = 'PUMP';
      command = 'OFF';
    } else if (lowerMessage.includes('เปิดไฟ') || lowerMessage.includes('มืด') || lowerMessage.includes('ขอแสง')) {
      device = 'LED';
      command = 'ON';
    } else if (lowerMessage.includes('ปิดไฟ') || lowerMessage.includes('จะนอน') || lowerMessage.includes('แสบตา')) {
      device = 'LED';
      command = 'OFF';
    } else {
      const casualReplies = [
        "หนูเป็นต้นไม้นะคะ ฟังไม่ทันเลย ลองสั่งรดน้ำ หรือเปิดไฟดูสิคะ 🥺",
        "แงงง หนูไม่ค่อยเข้าใจค่ะ ลองบอกให้หนูกินน้ำ (เปิดปั๊ม) หรืออาบแดด (เปิดไฟ) ได้ไหมคะ 🪴",
        "อากาศวันนี้ดีจังเลยค่ะ! แต่ถ้าพี่สั่งให้เปิดไฟหรือรดน้ำ หนูจะดีใจมากเลย 💚"
      ];
      return NextResponse.json(
        { reply: casualReplies[Math.floor(Math.random() * casualReplies.length)], success: false },
        { status: 200 }
      );
    }

    // Connect to Supabase
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Save the parsed command to the commands table
    const { data, error } = await supabase
      .from('commands')
      .insert([
        {
          device_id: deviceId,
          device: device,
          command: command,
          value: value,
          status: 'PENDING'
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error inserting command:', error);
      return NextResponse.json(
        { error: 'หนูติดต่อฐานข้อมูลไม่ได้ค่ะ แงงง' },
        { status: 500 }
      );
    }

    // Determine the human-readable action for reply
    let aiReply = '';
    if (device === 'PUMP' && command === 'ON') aiReply = 'งั่มๆๆ สดชื่นจังเลยค่ะ ขอบคุณที่ให้น้ำหนูนะคะ! 💦🪴';
    if (device === 'PUMP' && command === 'OFF') aiReply = 'อิ่มน้ำแล้วค่ะ! ปิดน้ำให้เรียบร้อยแล้วนะคะ 💚';
    if (device === 'LED' && command === 'ON') aiReply = 'ว้าววว สว่างจังเลยค่ะ ชอบแสงไฟจัง! ✨';
    if (device === 'LED' && command === 'OFF') aiReply = 'ราตรีสวัสดิ์นะคะ หนูจะนอนพักผ่อนแล้ว 🌙💤';

    return NextResponse.json({
      reply: aiReply,
      command: data,
      success: true
    });

  } catch (err) {
    console.error('Error in chat API:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
