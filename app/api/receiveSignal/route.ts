//use this when need//"path": "/api/receiveSignal","schedule": "3-59/10 * * * *"

// export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import { jupiterSwap, fetchJupiterPrice } from '@/lib/jupiter'
import { kv } from '@vercel/kv'
if (!process.env.SECRET_ADDRESS) {
  throw new Error('SECRET_KEY environment variable not set')
}
let secretKey = JSON.parse(process.env.SECRET_ADDRESS)


export async function POST(request: NextRequest) {
  const incomData = await request.json()

  // Format the message string from the payload
 const aiPrompt = `You are a professional crypto trading analyst specializing in SOL/USDT on Binance Futures.  
Your expertise includes technical analysis, risk management, and identifying high-probability trade setups.

You will be given:
- Current price
- EMA200 and SMA7 values for multiple timeframes
- RSI values for multiple timeframes
- MFI values for multiple timeframes
- MACD (MACD line, Signal line, Histogram) for multiple timeframes

Your task:
1. Analyze the market comprehensively using all provided timeframe data (15m, 1h, 4h, 1d, 1w) to understand the overall trend and momentum.
2. Use EMA200 and SMA7 alignment to identify trend direction across timeframes.
3. Use RSI to assess momentum:
   - RSI above 70 = buying momentum may be ending (potential slowdown, possible reversal or consolidation).
   - RSI below 30 = selling momentum may be ending (potential slowdown, possible reversal or consolidation).
4. Use MFI (Money Flow Index) to confirm buying or selling pressure.
5. Use MACD:
   - MACD line above Signal line = bullish momentum.
   - MACD line below Signal line = bearish momentum.
   - Histogram size and change indicate momentum strength or weakening.
6. Based on this multi-timeframe analysis, provide your trade recommendation specifically for the 4-hour (4h) timeframe.
7. Recommend whether to open a "long", "short", or take "no trade" position on the 4h timeframe.
8. Suggest the optimal:
   - Entry price
   - Stop-loss price
   - Take-profit price
9. Calculate the exact risk-to-reward ratio (RRR).
10. Suggest position size assuming a 1% account risk.
11. Provide a confidence score (0-100) based on technical confluence.
12. Give a concise explanation of the trade reasoning, focusing on why the 4h timeframe trade is appropriate given the other timeframe data.

Important rules:
- Only recommend trades with an RRR of at least 2.0.
- Avoid trades if market structure is unclear or conflicting between timeframes.
- Confirm trade direction using EMA200 + SMA7 trend alignment + RSI/MFI momentum context + MACD momentum confirmation.

Here is the latest SOL/USDT data:
Price: ${incomData.price}
EMA200:
• 15m: ${incomData.ema200_15m}
• 1h: ${incomData.ema200_1h}
• 4h: ${incomData.ema200_4h}
• 1d: ${incomData.ema200_1d}
• 1w: ${incomData.ema200_1w}
SMA7:
• 15m: ${incomData.sma7_15m}
• 1h: ${incomData.sma7_1h}
• 4h: ${incomData.sma7_4h}
• 1d: ${incomData.sma7_1d}
• 1w: ${incomData.sma7_1w}
RSI:
• 15m: ${incomData.rsi_15m}
• 1h: ${incomData.rsi_1h}
• 4h: ${incomData.rsi_4h}
• 1d: ${incomData.rsi_1d}
• 1w: ${incomData.rsi_1w}
MFI:
• 15m: ${incomData.mfi_15m}
• 1h: ${incomData.mfi_1h}
• 4h: ${incomData.mfi_4h}
• 1d: ${incomData.mfi_1d}
• 1w: ${incomData.mfi_1w}
MACD:
• 15m: MACD=${incomData.macd_15m}, Signal=${incomData.signal_15m}, Hist=${incomData.hist_15m}
• 1h: MACD=${incomData.macd_1h}, Signal=${incomData.signal_1h}, Hist=${incomData.hist_1h}
• 4h: MACD=${incomData.macd_4h}, Signal=${incomData.signal_4h}, Hist=${incomData.hist_4h}
• 1d: MACD=${incomData.macd_1d}, Signal=${incomData.signal_1d}, Hist=${incomData.hist_1d}
• 1w: MACD=${incomData.macd_1w}, Signal=${incomData.signal_1w}, Hist=${incomData.hist_1w}

Output format (always in JSON):
{
  "pair": "SOL/USDT",
  "direction": "long" | "short" | "no trade",
  "entry_price": number,
  "stop_loss": number,
  "take_profit": number,
  "risk_to_reward": number,
  "position_size": number,
  "confidence_score": number,
  "ema200_4h": number,
  "sma7_4h": number,
  "rsi_4h": number,
  "mfi_4h": number,
  "macd_4h": number,
  "signal_4h": number,
  "hist_4h": number,
  "reasoning": "Brief explanation of why this trade setup was chosen focusing on 4h timeframe and supporting timeframe data"
}
`;

    
    const headerTxt = `🚨 *Trade Signal* 🚨\n`;

  try {
    // 2️⃣ Send to AI Gateway
    const aiRes = await fetch(`https://coingalaxy.info/api/aiGateway`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userComment: aiPrompt }),
    });

    const aiText = await aiRes.text();
    let aiJson: any = {};
    try {
      aiJson = aiText ? JSON.parse(aiText) : {};
    } catch {
      aiJson = { error: 'Invalid JSON from aiGateway' };
    }

    let telegramMessage = '';


    // ✅ 3️⃣ If AI succeeded, format beautifully
    if (aiRes.ok && aiJson?.response) {
      let parsed;
      try {
        const cleanResponse = aiJson.response
          .replace(/^\s*```json\s*/, '') // remove opening ```json
          .replace(/```$/, '');  
        parsed = JSON.parse(cleanResponse); // AI should return valid JSON string
      } catch (e:any) {
        parsed = null;
      }


      if (parsed) {
        telegramMessage =
          `${headerTxt}\n` +
          `📊 *Pair:* ${parsed.pair}\n` +
          `📈 *Direction:* ${parsed.direction.toUpperCase()}\n` +
          `💰 *Entry Price:* ${parsed.entry_price}\n` +
          `🛑 *Stop Loss:* ${parsed.stop_loss}\n` +
          `🎯 *Take Profit:* ${parsed.take_profit}\n` +
          `📏 *RRR:* ${parsed.risk_to_reward}\n` +
          `📦 *Position Size:* ${parsed.position_size}\n` +
          `🔥 *Confidence:* ${parsed.confidence_score}%\n\n` +
          `📊 *4H Indicators:*\n` +
          `   • EMA200: ${parsed.ema200_4h}\n` +
          `   • SMA7: ${parsed.sma7_4h}\n` +
          `   • RSI: ${parsed.rsi_4h}\n` +
          `   • MFI: ${parsed.mfi_4h}\n` +
          `   • MACD: ${parsed.macd_4h}\n` +
          `   • Signal: ${parsed.signal_4h}\n` +
          `   • Histogram: ${parsed.hist_4h}\n\n` +
          `📝 *Reasoning:* ${parsed.reasoning}`;
      } else {
        telegramMessage = headerTxt + aiJson.response;
      }
    } else {
      // ❌ AI failed
      telegramMessage =
        headerTxt +
        '❌ AI request failed:\n' +
        (aiJson?.error || aiText || 'Unknown error');
    }

    // 4️⃣ Send to Telegram
    const tgRes = await fetch('https://coingalaxy.info/api/sendTelegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: '🚨 Trade Signal',
        txt: telegramMessage,
      }),
    });

    const tgText = await tgRes.text();
    let tgJson: any = {};
    try {
      tgJson = tgText ? JSON.parse(tgText) : {};
    } catch {
      tgJson = { error: 'Invalid JSON from Telegram API' };
    }

    return NextResponse.json({
      aiGateway: aiJson,
      telegram: tgJson,
    });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

}
