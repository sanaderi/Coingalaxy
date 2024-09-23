import { fetchJupiterPrice } from '@/lib/jupiter'
import clientPromise from '@/lib/mongodb'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const data = await fetchJupiterPrice('JUP')
    const jupPrice = data.data.JUP.price
    const client = await clientPromise
    const db = client.db('coingalaxy')
    const settingCollection = db.collection('setting')

    let highPrice = 0
    let lowPrice = 0
    let trend = ''
    const setting = await settingCollection.findOne({}, { sort: { _id: 1 } })

    if (setting) {
      highPrice = setting.high
      lowPrice = setting.low
      trend = setting.trend
      //Update latest high and low price
      if (jupPrice > setting.high) highPrice = jupPrice
      else if (jupPrice < setting.low) lowPrice = jupPrice
      //End update latest high and low price
    }
    // Upsert: update the pbKey and pvKey if wallet exists, or insert if it doesn't
    const result = await settingCollection.updateOne(
      { key: 'price' }, // Filter: match by wallet address
      {
        $set: {
          high: highPrice,
          low: lowPrice,
          trend: 'sell'
        }
      },
      { upsert: true } // Create a new document if no match is found
    )
    return NextResponse.json({ status: 1, message: 'success' })
  } catch {
    return NextResponse.json({ message: 'error' })
  }
}
