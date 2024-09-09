import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function POST(request: NextRequest) {
  try {
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
    const result = await collection.insertOne(body)

    // Return a success response
    return NextResponse.json({
      message: 'Data saved successfully',
      data: body
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}
