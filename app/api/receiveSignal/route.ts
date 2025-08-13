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
- EMA200 values for multiple timeframes
- RSI values for multiple timeframes
- MACD (MACD line, Signal line, Histogram) for multiple timeframes

Your task:
1. Analyze the market comprehensively using all provided timeframe data (15m, 1h, 4h, 1d, 1w) to understand the overall trend and momentum.
2. Use EMA200 alignment to identify trend direction across timeframes.
3. Use RSI to assess momentum:
   - RSI above 70 = buying momentum may be ending (potential slowdown, possible reversal or consolidation).
   - RSI below 30 = selling momentum may be ending (potential slowdown, possible reversal or consolidation).
4. Use MACD:
   - MACD line above Signal line = bullish momentum.
   - MACD line below Signal line = bearish momentum.
   - Histogram size and change indicate momentum strength or weakening.
5. Based on this multi-timeframe analysis, provide your trade recommendation specifically for the 4-hour (4h) timeframe.
6. Recommend whether to open a "long", "short", or take "no trade" position on the 4h timeframe.
7. Suggest the optimal:
   - Entry price
   - Stop-loss price
   - Take-profit price
8. Calculate the exact risk-to-reward ratio (RRR).
9. Suggest position size assuming a 1% account risk.
10. Provide a confidence score (0-100) based on technical confluence.
11. Give a concise explanation of the trade reasoning, focusing on why the 4h timeframe trade is appropriate given the other timeframe data.

Important rules:
- Only recommend trades with an RRR of at least 2.0.
- Avoid trades if market structure is unclear or conflicting between timeframes.
- Confirm trade direction using EMA200 trend alignment + RSI momentum context + MACD momentum confirmation.

Here is the latest SOL/USDT data:
Price: ${incomData.price}
EMA200:
• 15m: ${incomData.ema200_15m}
• 1h: ${incomData.ema200_1h}
• 4h: ${incomData.ema200_4h}
• 1d: ${incomData.ema200_1d}
• 1w: ${incomData.ema200_1w}
RSI:
• 15m: ${incomData.rsi_15m}
• 1h: ${incomData.rsi_1h}
• 4h: ${incomData.rsi_4h}
• 1d: ${incomData.rsi_1d}
• 1w: ${incomData.rsi_1w}
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
  "rsi_4h": number,
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
        parsed = JSON.parse(aiJson.response); // AI should return valid JSON string
      } catch {
        try {
            parsed = JSON.parse(JSON.parse(aiJson.response));
          } catch {
            parsed = null;
          }
      }

      if (parsed) {
        telegramMessage =
          `${headerTxt}` +
          `📊 *Pair:* ${parsed.pair}\n` +
          `📈 *Direction:* ${parsed.direction.toUpperCase()}\n` +
          `💰 *Entry Price:* ${parsed.entry_price}\n` +
          `🛑 *Stop Loss:* ${parsed.stop_loss}\n` +
          `🎯 *Take Profit:* ${parsed.take_profit}\n` +
          `📏 *RRR:* ${parsed.risk_to_reward}\n` +
          `📦 *Position Size:* ${parsed.position_size}\n` +
          `🔥 *Confidence:* ${parsed.confidence_score}%\n\n` +
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
  // Retrieve the inserted value (for verification)
  //   try {
  //     // Define the allowed IP addresses
  //     const allowedIPs = [
  //       // '::1',//For allow localhost
  //       '52.89.214.238',
  //       '34.212.75.30',
  //       '54.218.53.128',
  //       '52.32.178.7'
  //     ]

  //     // Get the IP address from the request headers
  //     const requestIP = request.headers.get('x-forwarded-for') || request.ip || ''

  //     // If there are multiple IPs (proxy), take the first one
  //     const ip = requestIP.split(',')[0].trim()

  //     // Check if the request IP matches any of the allowed IPs
  //     // if (!allowedIPs.includes(ip)) {
  //     //   return NextResponse.json(
  //     //     { error: 'Access denied: Your IP is not allowed.' },
  //     //     { status: 403 }
  //     //   )
  //     // }

  //     // Validate the data (optional)
  //     if (!body && body.sender && !body.type && body.value) {
  //       return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
  //     }

  //     const usdcToken = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  //     const jupToken = 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'

  //     // const zigzag = await kv.get('zigzag')
  //     const fgh = await kv.get('fgh')
  //     // const rsi = await kv.get('rsi')
  //     const rsi_crossing = await kv.get('rsi_crossing')
  //     console.log('rsi crossing'+rsi_crossing)
  //     let current_position = await kv.get('current_position')
  //     let swap_inprocess = await kv.get('swap_inprocess')

  //     if (swap_inprocess) {
  //       console.log('Already a Swap in progress')
  //       return NextResponse.json({ msg: 'Swap in progress' })
  //     }
  //     await kv.set('swap_inprocess', true)

  //     let sourceToken = ''
  //     let destinationToken = ''
  //     let runSwap = false

  //     if (body.sender === 'rsi_crossing') {
  //       kv.set('rsi_crossing', true)
  //       console.log('Rsi crossing 70')
  //     }

  //     if (body.sender === 'fgh') {
  //       if (body.type === 'buy' && current_position !== 'buy') {
  //         //We have a HL and rsi in buy mode
  //         sourceToken = usdcToken
  //         destinationToken = jupToken
  //         runSwap = true
  //         current_position = 'buy'
  //         await kv.set('buy_price', body.price)
  //         console.log(`buy_price: ${body.price}`)

  //         const tp_price = Number((body.price / 100) * 4) + Number(body.price)
  //         console.log(`tp_price: ${tp_price}`)
  //         await kv.set('tp_price', tp_price)

  //         const sl_price = Number(body.price) - Number(body.price / 100)
  //         console.log(`sl_price: ${sl_price}`)
  //         kv.set('sl_price', sl_price)

  //         console.info('RSI buy')
  //       } else if (body.type === 'sell' && current_position !== 'sell') {
  //         //It can run alone sell command
  //         sourceToken = jupToken
  //         destinationToken = usdcToken
  //         runSwap = true
  //         current_position = 'sell'
  //         console.info('fgh signal sell')
  //       }
  //       await kv.set('fgh', body.type)
  //     }

  //     if (!secretKey) throw new Error(`Address incorrect`)

  //     if (runSwap) {
  //       const result_swap: string | undefined = await jupiterSwap(
  //         sourceToken,
  //         destinationToken,
  //         secretKey
  //       )
  //       if (result_swap == 'success' || result_swap == 'insufficient_amount')
  //         await kv.set('current_position', current_position)

  //       return NextResponse.json({
  //         message: 'Swaped run',
  //         data: { msg: 'task run', ip, result: result_swap }
  //       })
  //     } else {
  //       return NextResponse.json({
  //         message: 'Condition incorrect'
  //       })
  //     }
  //   } catch (error) {
  //     return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  //   } finally {
  //     console.log('The Swap progress is over')
  //     await kv.set('swap_inprocess', false)
  //   }
  // }

  // export async function GET(request: NextRequest) {
  //   // Retrieve the inserted value (for verification)
  //   try {
  //     // Define the allowed IP addresses
  //     const allowedIPs = [
  //       // '::1',//For allow localhost
  //       '52.89.214.238',
  //       '34.212.75.30',
  //       '54.218.53.128',
  //       '52.32.178.7'
  //     ]

  //     // Get the IP address from the request headers
  //     const requestIP = request.headers.get('x-forwarded-for') || request.ip || ''

  //     // If there are multiple IPs (proxy), take the first one
  //     const ip = requestIP.split(',')[0].trim()

  //     // Check if the request IP matches any of the allowed IPs
  //     // if (!allowedIPs.includes(ip)) {
  //     //   return NextResponse.json(
  //     //     { error: 'Access denied: Your IP is not allowed.' },
  //     //     { status: 403 }
  //     //   )
  //     // }

  //     const usdcToken = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  //     const jupToken = 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'

  //     // const fgh = await kv.get('fgh')
  //     console.log('Get fgh')
  //     const fgh = await kv.get('fgh')
  //     console.log(`fgh value: ${fgh}`)

  //     console.log('Get rsi')
  //     const rsi = await kv.get('rsi')
  //     console.log(`rsi value: ${rsi}`)

  //     console.log('Get position')
  //     let current_position = await kv.get('current_position')
  //     console.log(`current_position: ${current_position}`)
  //     console.log('Get tp')
  //     let tp_price = await kv.get('tp_price')
  //     console.log('Get swap status')
  //     let swap_inprocess = await kv.get('swap_inprocess')
  //     console.log(`Start receive jup price`)
  //     const priceData = await fetchJupiterPrice('JUP')
  //     console.log(`Jup price received`)

  //     // const jupPrice = priceData.data.JUP.price
  //     // console.log(`current jup pirce: ${jupPrice}`)

  //     if (swap_inprocess) {
  //       console.log('Already a Swap in progress')
  //       return NextResponse.json({ msg: 'Swap in progress' })
  //     }
  //     await kv.set('swap_inprocess', true)

  //     let sourceToken = ''
  //     let destinationToken = ''
  //     let runSwap = false
  //     if (fgh === 'buy' && current_position == 'sell') {
  //       sourceToken = usdcToken
  //       destinationToken = jupToken
  //       runSwap = true
  //       current_position = 'buy'
  //       // const tp_price = (jupPrice / 100) * 4 + jupPrice
  //       // console.log(`tp_price: ${tp_price}`)
  //       // await kv.set('tp_price', tp_price)
  //       // const sl_price = jupPrice - Number(jupPrice / 100)
  //       // console.log(`sl_price: ${sl_price}`)
  //       // kv.set('sl_price', sl_price)
  //       console.info(`retry to buyy`)
  //     } else if (fgh === 'sell' && current_position == 'buy') {
  //       sourceToken = jupToken
  //       destinationToken = usdcToken
  //       runSwap = true
  //       current_position = 'sell'
  //       console.info('retry to selll')
  //     }
  //     // else if (jupPrice >= Number(tp_price) && current_position == 'buy') {
  //     //   sourceToken = jupToken
  //     //   destinationToken = usdcToken
  //     //   runSwap = true
  //     //   current_position = 'sell'
  //     //   await kv.set('zigzag', 'sell') //Simulate a HH or HL and force the bot to wait next signal
  //     //   console.info(`tp price: ${tp_price}`)
  //     //   console.info('retry to selll by tp method')
  //     // }
  //     console.log(`current_position: ${current_position}`)

  //     if (!secretKey) throw new Error(`Address incorrect`)

  //     if (runSwap) {
  //       const result_swap: string | undefined = await jupiterSwap(
  //         sourceToken,
  //         destinationToken,
  //         secretKey
  //       )
  //       if (result_swap == 'success' || result_swap == 'insufficient_amount') {
  //         await kv.set('current_position', current_position)
  //         console.log(`successfuly position changed to ${current_position}`)
  //       }

  //       return NextResponse.json({
  //         message: 'Swaped run',
  //         data: { msg: 'task run', ip, result: result_swap }
  //       })
  //     } else {
  //       return NextResponse.json({
  //         message: 'Condition incorrect'
  //       })
  //     }
  //   } catch (error) {
  // return NextResponse.json({ error: 'error' }, { status: 500 })
  //   } finally {
  //     console.log('The Swap progress is over')
  //     await kv.set('swap_inprocess', false)
  //   }
}
