export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import { jupiterSwap, fetchJupiterPrice } from '@/lib/jupiter'
import { kv } from '@vercel/kv'
if (!process.env.SECRET_ADDRESS) {
  throw new Error('SECRET_KEY environment variable not set')
}
let secretKey = JSON.parse(process.env.SECRET_ADDRESS)
export async function POST(request: NextRequest) {
  // Retrieve the inserted value (for verification)
  try {
    // Define the allowed IP addresses
    const allowedIPs = [
      // '::1',//For allow localhost
      '52.89.214.238',
      '34.212.75.30',
      '54.218.53.128',
      '52.32.178.7'
    ]

    // Get the IP address from the request headers
    const requestIP = request.headers.get('x-forwarded-for') || request.ip || ''

    // If there are multiple IPs (proxy), take the first one
    const ip = requestIP.split(',')[0].trim()

    // Check if the request IP matches any of the allowed IPs
    // if (!allowedIPs.includes(ip)) {
    //   return NextResponse.json(
    //     { error: 'Access denied: Your IP is not allowed.' },
    //     { status: 403 }
    //   )
    // }

    const body = await request.json()

    // Validate the data (optional)
    if (!body && body.sender && !body.type && body.value) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const usdcToken = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    const jupToken = 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'

    const zigzag = await kv.get('zigzag')
    const fgh = await kv.get('fgh')
    let current_position = await kv.get('current_position')
    let swap_inprocess = await kv.get('swap_inprocess')

    if (swap_inprocess) {
      console.log('Already a Swap in progress')
      return NextResponse.json({ msg: 'Swap in progress' })
    }
    await kv.set('swap_inprocess', true)

    let sourceToken = ''
    let destinationToken = ''
    let runSwap = false
    if (body.sender === 'fgh') {
      if (body.type === 'sell' && current_position !== 'sell') {
        //It can run alone sell command
        sourceToken = jupToken
        destinationToken = usdcToken
        runSwap = true
        current_position = 'sell'
        console.info('fgh signal sell')
      }
      await kv.set('fgh', body.type)
    } else if (body.sender === 'zigzag') {
      if (body.type === 'buy')
        kv.set('tmp_sl',body.price)
      if (body.type === 'buy' && fgh === 'buy' && current_position !== 'buy') {
        //We have a HL and fgh in buy mode
        sourceToken = usdcToken
        destinationToken = jupToken
        runSwap = true
        current_position = 'buy'
        await kv.set('buy_price', body.price)
        console.log(`buy_price: ${body.price}`)

        const tp_price = Number((body.price / 100) * 3) + Number(body.price)
        console.log(`tp_price: ${tp_price}`)
        await kv.set('tp_price', tp_price)
        console.info('zigzag signal buy, fgh latest: buy')
      } else if (body.type === 'sell' && current_position !== 'sell') {
        //It can run alone sell command
        sourceToken = jupToken
        destinationToken = usdcToken
        runSwap = true
        current_position = 'sell'
        console.info('zigzag signal sell')
      }
      await kv.set('zigzag', body.type)
    }

    if (!secretKey) throw new Error(`Address incorrect`)

    if (runSwap) {
      const result_swap: string | undefined = await jupiterSwap(
        sourceToken,
        destinationToken,
        secretKey
      )
      if (result_swap == 'success' || result_swap == 'insufficient_amount')
        await kv.set('current_position', current_position)

      return NextResponse.json({
        message: 'Swaped run',
        data: { msg: 'task run', ip, result: result_swap }
      })
    } else {
      return NextResponse.json({
        message: 'Condition incorrect'
      })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  } finally {
    console.log('The Swap progress is over')
    await kv.set('swap_inprocess', false)
  }
}

export async function GET(request: NextRequest) {
  // Retrieve the inserted value (for verification)
  try {
    // Define the allowed IP addresses
    const allowedIPs = [
      // '::1',//For allow localhost
      '52.89.214.238',
      '34.212.75.30',
      '54.218.53.128',
      '52.32.178.7'
    ]

    // Get the IP address from the request headers
    const requestIP = request.headers.get('x-forwarded-for') || request.ip || ''

    // If there are multiple IPs (proxy), take the first one
    const ip = requestIP.split(',')[0].trim()

    // Check if the request IP matches any of the allowed IPs
    // if (!allowedIPs.includes(ip)) {
    //   return NextResponse.json(
    //     { error: 'Access denied: Your IP is not allowed.' },
    //     { status: 403 }
    //   )
    // }

    const usdcToken = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    const jupToken = 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'

    const zigzag = await kv.get('zigzag')
    const fgh = await kv.get('fgh')
    let current_position = await kv.get('current_position')
    let tp_price = await kv.get('tp_price')
    let tmp_sl = await kv.get('tmp_sl')
    let swap_inprocess = await kv.get('swap_inprocess')
    const priceData = await fetchJupiterPrice('JUP')
    const jupPrice = priceData.data.JUP.price
    console.log(`current jup pirce: ${jupPrice}`)
    console.log(`current sl pirce: ${tmp_sl}`)

    if (swap_inprocess) {
      console.log('Already a Swap in progress')
      return NextResponse.json({ msg: 'Swap in progress' })
    }
    await kv.set('swap_inprocess', true)

    let sourceToken = ''
    let destinationToken = ''
    let runSwap = false
    if (fgh === 'buy' && zigzag == 'buy' && current_position == 'sell') {
      sourceToken = usdcToken
      destinationToken = jupToken
      runSwap = true
      current_position = 'buy'
      const tp_price = (jupPrice / 100) * 3 + jupPrice
      console.log(`tp_price: ${tp_price}`)
      await kv.set('tp_price', tp_price)
      console.info(`retry to buyy`)
    } else if (
      (fgh === 'sell' || zigzag == 'sell') &&
      current_position == 'buy'
    ) {
      sourceToken = jupToken
      destinationToken = usdcToken
      runSwap = true
      current_position = 'sell'
      console.info('retry to selll')
    } else if (jupPrice>=Number(tp_price) && current_position == 'buy') {
      sourceToken = jupToken
      destinationToken = usdcToken
      runSwap = true
      current_position = 'sell'
      await kv.set('zigzag', 'sell') //Simulate a HH or HL and force the bot to wait next signal
      console.info(`tp price: ${tp_price}`)
      console.info('retry to selll by tp method')
    }
    console.log(`current_position: ${current_position}`)

    if (!secretKey) throw new Error(`Address incorrect`)

    if (runSwap) {
      const result_swap: string | undefined = await jupiterSwap(
        sourceToken,
        destinationToken,
        secretKey
      )
      if (result_swap == 'success' || result_swap == 'insufficient_amount') {
        await kv.set('current_position', current_position)
        console.log(`successfuly position changed to ${current_position}`)
      }

      return NextResponse.json({
        message: 'Swaped run',
        data: { msg: 'task run', ip, result: result_swap }
      })
    } else {
      return NextResponse.json({
        message: 'Condition incorrect'
      })
    }
  } catch (error) {
    return NextResponse.json({ error: error }, { status: 500 })
  } finally {
    console.log('The Swap progress is over')
    await kv.set('swap_inprocess', false)
  }
}
