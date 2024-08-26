'use client'
import { z } from 'zod'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  TransactionInstruction,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  PublicKey
} from '@solana/web3.js'
import { useEffect, useState } from 'react'
import { truncateString } from '@/utils/truncateString'

interface DecryptedData {
  wallet_address: string
  url: string
  order_id: string
  value: number
  callback: string
}

export default function PaymentCard({ data }: { data: DecryptedData }) {
  const { connection } = useConnection()
  const { publicKey, sendTransaction } = useWallet()
  const [balance, setBalance] = useState<number>(0)

  useEffect(() => {
    if (publicKey) {
      ;(async function getBalanceEvery10Seconds() {
        const newBalance = await connection.getBalance(publicKey)
        setBalance(newBalance / LAMPORTS_PER_SOL)
        setTimeout(getBalanceEvery10Seconds, 100000)
      })()
    }
  }, [publicKey, connection, balance])

  const getAirdropOnClick = async () => {
    try {
      if (!publicKey) {
        throw new Error('Wallet is not Connected')
      }
      const [latestBlockhash, signature] = await Promise.all([
        connection.getLatestBlockhash(),
        connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL)
      ])
      const sigResult = await connection.confirmTransaction(
        { signature, ...latestBlockhash },
        'confirmed'
      )
      if (sigResult) {
        alert('Airdrop was confirmed!')
      }
    } catch (err) {
      alert('You are Rate limited for Airdrop')
    }
  }

  // Program ID for the Memo Program
  const MEMO_PROGRAM_ID = new PublicKey(
    'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
  )

  const paySol = async () => {
    if (!publicKey) {
      alert('Wallet not connected!')
      return
    }
    setIsLoading(true)

    try {
      const recipientPublicKey = new PublicKey(data.wallet_address)

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPublicKey,
          lamports: data.value * LAMPORTS_PER_SOL
        }),
        // Add the memo instruction
        new TransactionInstruction({
          keys: [],
          programId: MEMO_PROGRAM_ID, // The Memo Program ID
          data: Buffer.from(data.order_id.toString()) // Memo data, encoded as a Buffer
        })
      )

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'finalized')

      const newBalance = await connection.getBalance(publicKey)
      setBalance(newBalance / LAMPORTS_PER_SOL)
      const transactionLink = `https://explorer.solana.com/tx/${signature}?cluster=mainnet-beta`
      console.log(`View transaction: ${transactionLink}`)
      alert(`Payment successful!`)
    } catch (error: any) {
      if (error?.code === 4001) {
        // User rejected the transaction
        alert('Transaction was rejected by the user.')
      } else if (error?.message.includes('insufficient funds')) {
        // Not enough funds
        alert('Insufficient funds for transaction.')
      } else {
        alert('Payment failed! ' + error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Example usage

  const [isLoading, setIsLoading] = useState(false)

  return (
    <div>
      <div className="lg:mb-0 lg:w-full lg:max-w-6xl lg:grid-cols-6 lg:text-left">
        <div className="mt-8">
          <div>
            <div className="mt-6 w-full space-y-10 sm:mt-8 lg:mt-0 lg:max-w-xs xl:max-w-md">
              <div className="flow-root">
                <div className="-my-3 divide-y divide-gray-200 dark:divide-gray-800">
                  <dl className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                      Source website
                    </dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-white">
                      {data.url}
                    </dd>
                  </dl>

                  <dl className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                      Destination Wallet
                    </dt>
                    <dd className="text-base font-medium text-green-500">
                      {truncateString(data.wallet_address, 4, 4)}
                    </dd>
                  </dl>

                  <dl className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                      OrderId
                    </dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-white">
                      {data.order_id}
                    </dd>
                  </dl>

                  <dl className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-base font-bold text-gray-900 dark:text-white">
                      Total
                    </dt>
                    <dd className="text-base font-bold text-gray-900 dark:text-white">
                      {data.value}SOL
                    </dd>
                  </dl>
                </div>
              </div>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400 text-center">
                Recheck everything carefully and then click to payment
              </p>
              <div className="space-y-3">
                {publicKey ? (
                  <button
                    onClick={() => paySol()}
                    className="flex w-full items-center bg-green-700 justify-center rounded-lg  px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4  focus:ring-primary-300  dark:focus:ring-primary-800"
                  >
                    Proceed to Payment
                  </button>
                ) : (
                  <h1 className="text-center">Wallet is not connected</h1>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
