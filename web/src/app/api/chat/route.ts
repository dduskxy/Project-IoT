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

    // Mock NLP extraction
    if (lowerMessage.includes('เปิดปั๊ม') || lowerMessage.includes('รดน้ำ') || lowerMessage.includes('turn on pump')) {
      device = 'PUMP';
      command = 'ON';
    } else if (lowerMessage.includes('ปิดปั๊ม') || lowerMessage.includes('turn off pump')) {
      device = 'PUMP';
      command = 'OFF';
    } else if (lowerMessage.includes('เปิดไฟ') || lowerMessage.includes('turn on led')) {
      device = 'LED';
      command = 'ON';
    } else if (lowerMessage.includes('ปิดไฟ') || lowerMessage.includes('turn off led')) {
      device = 'LED';
      command = 'OFF';
    } else {
      return NextResponse.json(
        { reply: "ขออภัย ฉันไม่เข้าใจคำสั่งของคุณ กรุณาลองสั่งว่า 'เปิดปั๊ม', 'ปิดไฟ', 'รดน้ำ' ฯลฯ", success: false },
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
        { error: 'Failed to save command to database' },
        { status: 500 }
      );
    }

    // Determine the human-readable action for reply
    let humanReadableAction = '';
    if (device === 'PUMP' && command === 'ON') humanReadableAction = 'เปิดปั๊มน้ำ';
    if (device === 'PUMP' && command === 'OFF') humanReadableAction = 'ปิดปั๊มน้ำ';
    if (device === 'LED' && command === 'ON') humanReadableAction = 'เปิดไฟ';
    if (device === 'LED' && command === 'OFF') humanReadableAction = 'ปิดไฟ';

    return NextResponse.json({
      reply: `รับทราบค่ะ สั่ง${humanReadableAction}ให้แล้วค่ะ!`,
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
