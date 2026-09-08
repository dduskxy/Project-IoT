import { NextResponse } from 'next/server';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');

  if (!text) {
    return new NextResponse('Missing text parameter', { status: 400 });
  }

  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata("th-TH-PremwadeeNeural", OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
    
    const { audioStream } = tts.toStream(text);

    const audioBuffer = await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = [];
      audioStream.on('data', (chunk) => chunks.push(chunk));
      audioStream.on('close', () => resolve(Buffer.concat(chunks)));
      audioStream.on('error', (err) => reject(err));
    });

    return new NextResponse(new Uint8Array(audioBuffer), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error: any) {
    console.error('TTS Proxy Error:', error);
    return new NextResponse('Error generating TTS', { status: 500 });
  }
}
