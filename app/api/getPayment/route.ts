import { NextRequest, NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'
import crypto from 'crypto'

// API route to decrypt data for a payment by mongo_id
export async function POST(req: NextRequest) {
  try {
    // Extract id from request body
    const { pageId }: { pageId: string } = await req.json()

    // Validate id
    if (!ObjectId.isValid(pageId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid ID format' },
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('coingalaxy')

    // 1. Fetch the payment data by mongo_id
    const payment = await db
      .collection('payments')
      .findOne({ _id: new ObjectId(pageId) })
    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    // 2. Find the user by matching the field value in the users collection
    const user = await db
      .collection('users')
      .findOne({ pbKey: payment.publicKey })
    if (!user || !user.pvKey) {
      return NextResponse.json(
        { success: false, error: 'User or private key not found' },
        { status: 404 }
      )
    }

    // Convert base64-encoded private key to DER format buffer
    const privateKeyBuffer = Buffer.from(user.pvKey, 'base64')

    // Convert DER-format private key to PEM format
    const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyBuffer
      .toString('base64')
      .match(/.{1,64}/g)
      ?.join('\n')}\n-----END PRIVATE KEY-----`

    // Convert the encrypted data from base64 to binary
    const encryptedBuffer = Buffer.from(payment.value, 'base64')

    // Decrypt the data using the provided private key
    const decryptedData = crypto.privateDecrypt(
      {
        key: privateKeyPem,
        padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
      },
      encryptedBuffer
    )

    // Convert the decrypted data to a string (assuming it's UTF-8)
    const decryptedString = decryptedData.toString('utf8')

    // Return the decrypted data
    return NextResponse.json({
      success: true,
      decryptedData: decryptedString
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
