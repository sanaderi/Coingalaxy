// import { fetchJupiterPrice } from '@/lib/jupiter'
// import clientPromise from '@/lib/mongodb'
// import { NextResponse } from 'next/server'

// export async function GET() {
//   try {
//     // Fetch current JUP price
//     const data = await fetchJupiterPrice('JUP')
//     const jupPrice = data.data.JUP.price

//     // Connect to MongoDB
//     const client = await clientPromise
//     const db = client.db('coingalaxy')
//     const settingCollection = db.collection('setting')

//     // Initialize variables
//     let previousHigh,
//       previousLow,
//       highPrice,
//       lowPrice,
//       trend = ''
//     let HH,
//       LL,
//       LH,
//       HL = 0

//     // Fetch the current price settings from MongoDB
//     const setting = await settingCollection.findOne({ key: 'price' })

//     if (setting) {
//       previousHigh = setting.previousHigh || 0
//       previousLow = setting.previousLow || 0
//       highPrice = setting.high || jupPrice
//       lowPrice = setting.low || jupPrice
//       HH = setting.HH || highPrice
//       LL = setting.LL || lowPrice
//       LH = setting.LH || 0
//       HL = setting.HL || 0
//       trend = setting.trend || ''

//       // Check for HH, LL, LH, and HL
//       if (jupPrice > highPrice) {
//         highPrice = jupPrice
//         if (jupPrice > previousHigh) {
//           trend = 'Higher High (HH)'
//           HH = jupPrice // Update new HH
//         } else {
//           trend = 'Lower High (LH)'
//           LH = jupPrice // Update new LH
//         }
//         previousHigh = highPrice // Update previous high
//       } else if (jupPrice < lowPrice) {
//         lowPrice = jupPrice
//         if (jupPrice < previousLow) {
//           trend = 'Lower Low (LL)'
//           LL = jupPrice // Update new LL
//         } else {
//           trend = 'Higher Low (HL)'
//           HL = jupPrice // Update new HL
//         }
//         previousLow = lowPrice // Update previous low
//       }

//       // Upsert (update or insert) the price data and detected trend (HH, LL, LH, HL)
//       await settingCollection.updateOne(
//         { key: 'price' }, // Filter by 'key'
//         {
//           $set: {
//             high: highPrice,
//             low: lowPrice,
//             previousHigh: previousHigh,
//             previousLow: previousLow,
//             HH: HH, // Store new HH
//             LL: LL, // Store new LL
//             LH: LH, // Store new LH
//             HL: HL, // Store new HL
//             trend: trend // Store detected trend
//           }
//         },
//         { upsert: true }
//       )
//     }

//     return NextResponse.json({
//       status: 1,
//       high: highPrice,
//       low: lowPrice,
//       previousHigh: previousHigh,
//       previousLow: previousLow,
//       HH: HH, // Store new HH
//       LL: LL, // Store new LL
//       LH: LH, // Store new LH
//       HL: HL, // Store new HL
//       trend: trend, // Store detected trend
//       price: jupPrice
//     })
//   } catch (error) {
//     console.error(error)
//     return NextResponse.json({ status: 0, message: 'error' })
//   }
// }
