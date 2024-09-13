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

    let current_time = Math.floor(Date.now() / 1000)
    let second_time = firstDoc.time + 300
    if (firstDoc && second_time < current_time) {
      return NextResponse.json(
        {
          error: 'Not found new signal'
        },
        { status: 500 }
      )
    }

    const nowUTC = new Date(Date.now()).toISOString()

    // Insert the data into MongoDB
    const result = await collection.insertOne({
      msg: `New position: ${firstDoc.signal}`,
      ip,
      time: nowUTC
    })

    const id = firstDoc._id
    // Update the existing document
    const update = { $set: { confirm: false } }
    await status_collection.findOneAndUpdate({ _id: id }, update, {
      returnDocument: 'after'
    })

    // Return a success response
    return NextResponse.json({
      message: 'Data saved successfully',
      data: { msg: 'task run', ip }
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}
