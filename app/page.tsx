'use client'
import { z } from 'zod'

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import {
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  PublicKey
} from '@solana/web3.js'
import { useEffect, useState } from 'react'
import Head from 'next/head'

export default function Home() {
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

  const paySol = async () => {
    if (!publicKey) {
      alert('Wallet not connected!')
      return
    }
    setIsLoading(true)

    try {
      const recipientPublicKey = new PublicKey(formValues.destination)

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPublicKey,
          lamports: 0.4 * LAMPORTS_PER_SOL
        })
      )

      const signature = await sendTransaction(transaction, connection)
      await connection.confirmTransaction(signature, 'finalized')

      const newBalance = await connection.getBalance(publicKey)
      setBalance(newBalance / LAMPORTS_PER_SOL)

      alert('Payment successful!')
    } catch (error: any) {
      if (error?.code === 4001) {
        // User rejected the transaction
        alert('Transaction was rejected by the user.')
      } else if (error?.message.includes('insufficient funds')) {
        // Not enough funds
        alert('Insufficient funds for transaction.')
      } else {
        console.error('Payment failed', error)
        alert('Payment failed! ' + error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formSchema = z.object({
    destination: z
      .string({ required_error: 'Destination is required' })
      .min(5, { message: 'Destination must be more than 5 characters' })
      .max(500, { message: 'Destination must be less than 500 characters' })
      .trim(),
    value: z.coerce
      .number({ required_error: 'Value is required' })
      .min(1, { message: 'Value should be more than 0' })
  })
  type FormSchema = z.infer<typeof formSchema>

  const [formValues, setFormValues] = useState<z.infer<typeof formSchema>>({
    destination: '',
    value: 0
  })

  const [isLoading, setIsLoading] = useState(false)

  return (
    <div>
      <Head>
        <title>Home Page | Coingalaxy</title>
        <meta
          name="description"
          content="Welcome to Coingalaxy. Discover the best services for your crypto needs."
        />
      </Head>

      <div className="lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left">
        <div className="mt-8">
          {publicKey ? (
            <div className="flex flex-col ">
              <h2>Your Balance is: {balance} SOL</h2>
              <div>
                {/* <button
              onClick={getAirdropOnClick}
              type="button"
              className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            >
              Get Airdrop
              </button>
               */}

                <div className="py-4">
                  <div className="flex space-x-4">
                    <div>
                      <label
                        htmlFor="textbox"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Destination Wallet Address
                      </label>
                      <input
                        id="textbox"
                        type="text"
                        autoComplete="off"
                        className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Type here..."
                        onChange={(event) =>
                          setFormValues({
                            ...formValues,
                            destination: event.target.value
                          })
                        }
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="textbox"
                        className="block text-sm font-medium text-white mb-2"
                      >
                        Value
                      </label>
                      <input
                        id="textbox"
                        type="number"
                        autoComplete="off"
                        onChange={(event) =>
                          setFormValues({
                            ...formValues,
                            value: Number(event.target.value)
                          })
                        }
                        className="mt-1 block w-full text-black px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Type here..."
                      />
                    </div>
                    <div>
                      <button
                        disabled={isLoading || formValues.value == 0}
                        onClick={() => paySol()}
                        type="button"
                        className="mt-6 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                      >
                        {isLoading
                          ? 'Processing...'
                          : `Pay ${formValues.value} SOL`}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <h1>Wallet is not connected</h1>
          )}
        </div>
      </div>
    </div>
  )
}
