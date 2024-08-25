import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'

export async function POST(request: NextRequest) {
  try {
    // Parse the incoming request body as JSON
    const body = await request.json()

    // Validate the data (optional)
    if (!body || !body.wallet || !body.pvKey || !body.pbKey) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db('coingalaxy')
    const collection = db.collection('users')

    // Upsert: update the pbKey and pvKey if wallet exists, or insert if it doesn't
    const result = await collection.updateOne(
      { wallet: body.wallet }, // Filter: match by wallet address
      {
        $set: {
          pvKey: body.pvKey,
          pbKey: body.pbKey
        }
      },
      { upsert: true } // Create a new document if no match is found
    )

    // Return a success response
    return NextResponse.json({ message: 'Data saved successfully', result })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
  }
}
