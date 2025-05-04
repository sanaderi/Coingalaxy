import { NextRequest, NextResponse } from 'next/server'
export async function POST(request: NextRequest) {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;
    const body = await request.json();
    if (!body.subject || !body.txt) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: body.txt,
        parse_mode: 'HTML',  // Enable HTML formatting

      }),
    });
  
    const data = await res.json();
  
    if (!res.ok) {
      return new NextResponse(JSON.stringify({ error: data }), { status: res.status });
    }
  
    return new NextResponse(JSON.stringify({ success: true }), { status: 200 });
  }
  