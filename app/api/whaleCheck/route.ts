import { NextRequest, NextResponse } from 'next/server'
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import fs from 'fs'

const SOLANA_CLUSTER = process.env.NEXT_PUBLIC_RPC_URL
if (!SOLANA_CLUSTER) throw new Error('Environment variable NEXT_PUBLIC_RPC_URL is not set')

const connection = new Connection(SOLANA_CLUSTER, 'confirmed')
const whaleAddresses = [
  new PublicKey('MfDuWeqSHEqTFVYZ7LoexgAK9dxk7cy4DFJWjWMGVWa'),
  new PublicKey('adbX7mffbFeQZfuMiVVH1yA4AvpNNn8wb2n2wuwb7aC'),
  new PublicKey('arsc4jbDnzaqcCLByyGo7fg7S2SmcFsWUzQuDtLZh2y'),
]
const balanceFilePath = './balances.json'

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
          `Wallet ${address} ${direction} by ${absDiff.toFixed(2)} SOL\nPrevious: ${previousBalance.toFixed(2)} SOL\nCurrent: ${balanceInSol.toFixed(2)} SOL\n`
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

    // If any wallet has changed significantly, send an email
    if (significantChanges.length > 0) {
      const emailText = significantChanges.join('\n\n')
      const res = await fetch('https://coingalaxy.info/api/sendEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: '🚨 Whale Wallet Alert',
          txt: emailText,
        }),
      })

      // Handle possible empty or invalid JSON responses
      try {
        const text = await res.text()
        const json = text ? JSON.parse(text) : {}
        console.log('Email response:', json)
      } catch (e) {
        console.error('Failed to parse email response:', e)
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

async function getPreviousBalances() {
  if (fs.existsSync(balanceFilePath)) {
    const data = fs.readFileSync(balanceFilePath, 'utf-8')
    return JSON.parse(data)
  }
  return {}
}

// Define the type for balances
interface Balances {
  [walletAddress: string]: number;
}
async function saveBalance(walletAddress: string, balance: number) {
  let balances: Balances = {}; // Define the type for balances

  if (fs.existsSync(balanceFilePath)) {
    const data = fs.readFileSync(balanceFilePath, 'utf-8')
    balances = JSON.parse(data)
  }

  balances[walletAddress] = balance
  fs.writeFileSync(balanceFilePath, JSON.stringify(balances, null, 2), 'utf-8')
}
