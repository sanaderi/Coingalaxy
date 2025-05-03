// import { NextRequest, NextResponse } from 'next/server'
// import clientPromise from '../../../lib/mongodb'

// /**
//  * @swagger
//  * /api/generatePayment:
//  *   post:
//  *     summary: Generate a payment link
//  *     description: This endpoint allows you to create a new payment link by providing the required data in the request body.
//  *     tags:
//  *       - Required
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               value:
//  *                 type: string
//  *                 description: Encrypted data by your public key
//  *               publicKey:
//  *                 type: string
//  *                 description: your public key
//  *             required:
//  *               - value
//  *               - publicKey
//  *     responses:
//  *       200:
//  *         description: Payment link successfully generated
//  *       400:
//  *         description: Bad Request - Invalid input
//  */

// export async function POST(request: NextRequest) {
//   try {
//     // Parse the incoming request body as JSON
//     const body = await request.json()

//     // Validate the data (optional)
//     if (!body || !body.publicKey || !body.value) {
//       return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
//     }

//     // Connect to MongoDB
//     const client = await clientPromise
//     const db = client.db('coingalaxy')
//     const collection = db.collection('payments')

//     // Insert the data into MongoDB
//     const result = await collection.insertOne(body)

//     // Return a success response
//     const paymentLink = `${process.env.WEBSITE_URL}/payment/${result.insertedId}`
//     return NextResponse.json({
//       message: 'Data saved successfully',
//       payment_link: paymentLink
//     })
//   } catch (error) {
//     return NextResponse.json({ error: 'Failed to save data' }, { status: 500 })
//   }
// }
