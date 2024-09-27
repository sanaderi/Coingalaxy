export const maxDuration = 300

import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { jupiterSwap } from '@/lib/jupiter'
import { kv } from '@vercel/kv'

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

    const address: Array<number> | null = await kv.get('address')
    const zigzag = await kv.get('zigzag')
    const fgh = await kv.get('fgh')

    let sourceToken = ''
    let destinationToken = ''
    let runSwap = false
    if (body.sender === 'fgh') {
      if (body.type === 'buy' && zigzag === 'buy') {
        sourceToken = usdcToken
        destinationToken = jupToken
        runSwap = true
      } else if (body.type === 'sell' && zigzag === 'sell') {
        sourceToken = jupToken
        destinationToken = usdcToken
        runSwap = true
      }
      await kv.set('fgh', body.type)
    } else if (body.sender === 'zigzag') {
      if (body.type === 'buy' && fgh === 'buy') {
        sourceToken = usdcToken
        destinationToken = jupToken
        runSwap = true
      } else if (body.type === 'sell' && fgh === 'sell') {
        console.log('here run')
        sourceToken = jupToken
        destinationToken = usdcToken
        runSwap = true
      }
      await kv.set('zigzag', body.type)
    }

    if (!address) throw new Error(`Address incorrect`)

    if (runSwap) {
      const result_swap: string | undefined = await jupiterSwap(
        sourceToken,
        destinationToken,
        address,
        0
      )

      return NextResponse.json({
        message: 'Data saved successfully',
        data: { msg: 'task run', ip, result: result_swap }
      })
    } else {
      return NextResponse.json({
        message: 'Condition incorrect'
      })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}
