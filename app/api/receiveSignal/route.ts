import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

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

    // Parse the incoming request body as JSON
    const body = await request.json()

    // Validate the data (optional)
    if (!body) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('coingalaxy')
    const collection = db.collection('trade_history')

    // Insert the data into MongoDB
    const result = await collection.insertOne({ ...body, ip })

    // Return a success response
    return NextResponse.json({
      message: 'Data saved successfully',
      data: body
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}
