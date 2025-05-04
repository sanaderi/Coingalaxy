// app/api/whaleCheck/route.ts (Next.js 13+ API Route)
import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import clientPromise from '@/lib/mongodb'

const SOLANA_CLUSTER = process.env.NEXT_PUBLIC_RPC_URL
if (!SOLANA_CLUSTER) throw new Error('Environment variable NEXT_PUBLIC_RPC_URL is not set')

const connection = new Connection(SOLANA_CLUSTER, 'confirmed')

const whaleAddresses = [
  new PublicKey('MfDuWeqSHEqTFVYZ7LoexgAK9dxk7cy4DFJWjWMGVWa'),
  new PublicKey('adbX7mffbFeQZfuMiVVH1yA4AvpNNn8wb2n2wuwb7aC'),
  new PublicKey('arsc4jbDnzaqcCLByyGo7fg7S2SmcFsWUzQuDtLZh2y'),
]

export async function GET(req: NextRequest) {
  try {
    const walletBalances: any[] = []
    const previousBalances = await getPreviousBalances()
    const significantChanges: string[] = []

    for (const walletAddress of whaleAddresses) {
      const balance = await connection.getBalance(walletAddress)
      const balanceInSol = balance / LAMPORTS_PER_SOL

      const address = walletAddress.toBase58()
      const previousBalance = previousBalances[address] || 0
      const diff = balanceInSol - previousBalance
      const absDiff = Math.abs(diff)

      if (absDiff > 55) {
        const direction = diff > 0 ? 'increased' : 'decreased'
        significantChanges.push(
          `Wallet: ${address}\n` +
          `Direction: ${direction}\n` +
          `Change: ${absDiff.toFixed(2)} SOL\n` +
          `Previous Balance: ${previousBalance.toFixed(2)} SOL\n` +
          `Current Balance: ${balanceInSol.toFixed(2)} SOL\n`
        )
      }

      walletBalances.push({
        address,
        balance: balanceInSol,
        previousBalance,
        balanceDifference: absDiff,
      })

      await saveBalance(address, balanceInSol)
    }

    // If any wallet has changed significantly, send a Telegram message using your custom API
    if (significantChanges.length > 0) {
      const messageText = `🚨 **Whale Wallet Alert** 🚨\n\n` + significantChanges.join('\n\n')
      const res = await fetch('https://coingalaxy.info/api/sendTelegram', {  // Replace with your API URL
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: '🚨 Whale Wallet Alert',
          txt: messageText,
        }),
      })

      try {
        const text = await res.text()
        const json = text ? JSON.parse(text) : {}
        console.log('Custom API response:', json)
      } catch (e) {
        console.error('Failed to parse custom API response:', e)
      }
    }

    return NextResponse.json(walletBalances)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}

// Load previous balances from MongoDB
interface Balances {
  [walletAddress: string]: number;
}
async function getPreviousBalances(): Promise<Balances> {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection('whale_balances')

  const docs = await collection.find().toArray()
  const balances: Balances = {}

  docs.forEach(doc => {
    balances[doc.address] = doc.balance
  })

  return balances
}

// Save or update balance in MongoDB
async function saveBalance(walletAddress: string, balance: number) {
  const client = await clientPromise
  const db = client.db()
  const collection = db.collection('whale_balances')

  await collection.updateOne(
    { address: walletAddress },
    { $set: { address: walletAddress, balance, updatedAt: new Date() } },
    { upsert: true }
  )
}
