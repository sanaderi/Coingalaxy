// app/api/chatgpt/route.ts
import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [`https://coingalaxy.info`];

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');

 if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return NextResponse.json(
      { error: 'Access denied' },
      { status: 403 }
    );
  }

  let body: { userComment?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body' },
      { status: 400 }
    );
  }

  const { userComment } = body || {};
  if (!userComment) {
    return NextResponse.json(
      { error: 'Comment is required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{ role: 'user', content: userComment }],
        max_tokens: 420,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return NextResponse.json(
        { error: 'Failed to fetch AI response' },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json({ response: data.choices[0].message.content });
  } catch (error) {
    console.error('ChatGPT API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI response' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
