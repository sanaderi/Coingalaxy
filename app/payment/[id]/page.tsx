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
import { truncateString } from '@/utils/truncateString'
import { useParams } from 'next/navigation'

export default function Payment() {
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

  const params = useParams()
  const pageId = params.id! // Extract id from the URL params
  useEffect(() => {
    // Fetch the payment data only once when the component mounts
    const fetchPaymentData = async () => {
      try {
        const response = await fetch('/api/getPayment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ pageId: pageId }) // Send pageId as part of the request body
        })

        const data = await response.json()
        console.log(data.decryptedData)
        console.log(JSON.parse(data.decryptedData).wallet_address)
      } catch (error) {
        console.error('Error fetching payment data:', error)
      }
    }

    fetchPaymentData()
  }, [pageId]) // Depend on pageId, ensures it only runs when pageId changes

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
          lamports: formValues.value * LAMPORTS_PER_SOL
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
    destination: 'CqsrMXftjq31vNRBwJJZZqLX9tGYhV5wgrxAYemV4fyJ',
    value: 1
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
                      https://macrob2b.com
                    </dd>
                  </dl>

                  <dl className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                      Destination Wallet
                    </dt>
                    <dd className="text-base font-medium text-green-500">
                      {truncateString(formValues.destination, 4, 4)}
                    </dd>
                  </dl>

                  <dl className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-base font-normal text-gray-500 dark:text-gray-400">
                      OrderId
                    </dt>
                    <dd className="text-base font-medium text-gray-900 dark:text-white">
                      745214
                    </dd>
                  </dl>

                  <dl className="flex items-center justify-between gap-4 py-3">
                    <dt className="text-base font-bold text-gray-900 dark:text-white">
                      Total
                    </dt>
                    <dd className="text-base font-bold text-gray-900 dark:text-white">
                      {formValues.value}SOL
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
