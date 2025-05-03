// import Head from 'next/head'
// import PaymentCard from '../../components/payment/PaymentCard'
// import { NextRequest, NextResponse } from 'next/server'
// import clientPromise from '../../../lib/mongodb'
// import { ObjectId } from 'mongodb'
// import crypto from 'crypto'

// import type { Metadata } from 'next'

// export const metadata: Metadata = {
//   title: 'Payment | Coingalaxy',
//   description: 'Solana payment gateway'
// }

export default async function Payment({ params }: { params: { id: string } }) {
//   const pageId = params.id

//   // Validate id
//   if (!ObjectId.isValid(pageId)) {
//     return NextResponse.json(
//       { success: false, error: 'Invalid ID format' },
//       { status: 400 }
//     )
//   }

//   const client = await clientPromise
//   const db = client.db('coingalaxy')

//   // 1. Fetch the payment data by mongo_id
//   const payment = await db
//     .collection('payments')
//     .findOne({ _id: new ObjectId(pageId) })
//   if (!payment) {
//     return NextResponse.json(
//       { success: false, error: 'Payment not found' },
//       { status: 404 }
//     )
//   }

//   // 2. Find the user by matching the field value in the users collection
//   const user = await db
//     .collection('users')
//     .findOne({ pbKey: payment.publicKey })
//   if (!user || !user.pvKey) {
//     return NextResponse.json(
//       { success: false, error: 'User or private key not found' },
//       { status: 404 }
//     )
//   }

//   // Convert base64-encoded private key to DER format buffer
//   const privateKeyBuffer = Buffer.from(user.pvKey, 'base64')

//   // Convert DER-format private key to PEM format
//   const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyBuffer
//     .toString('base64')
//     .match(/.{1,64}/g)
//     ?.join('\n')}\n-----END PRIVATE KEY-----`

//   // Convert the encrypted data from base64 to binary
//   const encryptedBuffer = Buffer.from(payment.value, 'base64')

//   // Decrypt the data using the provided private key
//   const decryptedData = crypto.privateDecrypt(
//     {
//       key: privateKeyPem,
//       padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
//     },
//     encryptedBuffer
//   )

//   // Convert the decrypted data to a string (assuming it's UTF-8)

//   const decryptedString = decryptedData.toString('utf8')

//   interface DecryptedData {
//     wallet_address: string
//     url: string
//     order_id: string
//     value: number
//     callback: string
//   }
//   const decryptedObject: DecryptedData = JSON.parse(decryptedString)

  return (
    <div>
        Hellp
      {/* <PaymentCard data={decryptedObject} /> */}
    </div>
  )
}
