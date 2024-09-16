export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { jupiterSwap } from '@/lib/jupiter'

export async function POST(request: NextRequest) {
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
    if (!body && !body.type && body.value) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    const usdcToken = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    const jupToken = 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN'

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('coingalaxy')
    const status_collection = db.collection('signal_status')
    const collection = db.collection('order_history')

    const firstDoc = await status_collection.findOne({}, { sort: { _id: 1 } })

    if (!firstDoc) {
      return NextResponse.json(
        {
          error: 'No document found'
        },
        { status: 500 }
      )
    }

    const nowUTC = new Date(Date.now()).toISOString()

    let sourceToken = ''
    let destinationToken = ''
    if (body.type === 'buy') {
      sourceToken = usdcToken
      destinationToken = jupToken
    } else if (body.type == 'sell') {
      sourceToken = jupToken
      destinationToken = usdcToken
    }

    const result_swap: string | undefined = await jupiterSwap(
      sourceToken,
      destinationToken,
      firstDoc.address
    )

    // Insert the data into MongoDB
    await collection.insertOne({
      msg: `New position: ${body.type}`,
      ip,
      time: nowUTC,
      result: result_swap
    })

    // Return a success response
    return NextResponse.json({
      message: 'Data saved successfully',
      data: { msg: 'task run', ip, result: result_swap }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}
