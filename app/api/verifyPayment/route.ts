// // pages/api/transaction.js

import { NextResponse, NextRequest } from 'next/server'

import { Connection, PublicKey } from '@solana/web3.js'
import { string } from 'zod'

// // Define the Solana cluster endpoint
const SOLANA_CLUSTER = process.env.NEXT_PUBLIC_RPC_URL
if (!SOLANA_CLUSTER) {
  throw new Error('Environment variable NEXT_PUBLIC_RPC_URL is not set')
}

const connection = new Connection(SOLANA_CLUSTER, 'confirmed')

// // Helper function to get transaction details
const getTransactionDetails = async (signature: string) => {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed'
    })
    if (!transaction) {
      console.error('No transaction data found.')
      return { status: 'unknown', memoData: [] }
    }
    // Extract log messages and status
    const { meta, slot } = transaction
    const logMessages = meta?.logMessages || []
    const confirmationStatus = meta?.err ? 'failed' : 'confirmed'
    console.log(confirmationStatus)

    return {
      status: confirmationStatus,
      logMessages,
      slot
    }
  } catch (error) {
    console.error('Failed to fetch transaction details:', error)
    return null
  }
}

/**
 * @swagger
 * /api/verifyPayment:
 *   post:
 *     summary: Encrypt data
 *     description: This endpoint allows you to verify payment and the required data in the request body.
 *     tags:
 *       - Required
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 description: Contains wallet address, URL, and other relevant fields
 *                 properties:
 *                   paymentId:
 *                     type: string
 *                     description: Payment id generated in first level
 *             required:
 *               - paymentId
 *     responses:
 *       200:
 *         description: Payment link successfully generated
 *       400:
 *         description: Bad Request - Invalid input
 */

// Helper function to extract memo data from logs
const extractMemoDataFromLogs = (logMessages: Array<string>) => {
  const memoPrefix = 'Program log: Memo (len '
  const memoData = logMessages
    .filter((log) => log.startsWith(memoPrefix)) // Filter logs starting with the memo prefix
    .map((log) => {
      const dataStartIndex = log.indexOf('"') + 1
      const dataEndIndex = log.lastIndexOf('"')
      return log.substring(dataStartIndex, dataEndIndex) // Extract the memo data
    })

  return memoData
}

// API route handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    //Tmp we need retrieve signature from db base on payment id
    if (!body || !body.signature) {
      return NextResponse.json({ error: 'Signature is required' })
    }

    const transaction = await getTransactionDetails(body.signature)

    if (!transaction) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch transaction details'
      })
    }

    // Extract log messages and memo data
    const { logMessages } = transaction
    if (!logMessages)
      return NextResponse.json({
        status: 500,
        error: 'Transaction not found'
      })
    const memoData = extractMemoDataFromLogs(logMessages)
    const orderId = memoData[0]
    return NextResponse.json({
      status: transaction.status,
      orderId,
      slot: transaction.slot
    })
  } catch {
    return NextResponse.json(
      { error: 'Failed to verify data' },
      { status: 500 }
    )
  }
}
