'use client'
import { z } from 'zod'
import { getProgram } from '../../../utils/createPlan' // Adjust the path as needed

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN, web3 } from '@project-serum/anchor' // Import BN
import { PublicKey } from '@solana/web3.js'

import { useEffect, useState } from 'react'
import { AnchorProvider } from '@coral-xyz/anchor'

interface DecryptedData {
  wallet_address: string
  url: string
  order_id: string
  value: number
  callback: string
}

export default function SubscribeCard() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const [isLoading, setIsLoading] = useState(false)

  const handleCreatePlan = async () => {
    const planTitle = 'new title'
    const expirationDate = Date.now()

    try {
      const program = getProgram()
      const provider = program.provider as AnchorProvider

      // Generate a new keypair for the plan
      const plan = web3.Keypair.generate()

      // Call the `createPlan` instruction defined in the IDL
      await program.rpc.createPlan(planTitle, new BN(expirationDate), {
        accounts: {
          plan: plan.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
        },
        signers: [plan]
      })
      console.log('Plan created with address:', plan.publicKey.toBase58())
    } catch (err) {
      console.error('Failed to create plan:', err)
    }
  }

  const getPlansByUser = async (userPublicKey: PublicKey) => {
    const program = getProgram()
    const provider = program.provider

    try {
      // Fetch all accounts for the program where the owner is the user's public key
      const accounts = await connection.getProgramAccounts(program.programId, {
        filters: [
          {
            memcmp: {
              offset: 8, // Adjust based on where the owner field is in the Plan struct
              bytes: userPublicKey.toBase58()
            }
          }
        ]
      })

      // Decode each account data to get the plan details
      const plans = accounts.map((account) => {
        return program.account.plan.coder.accounts.decode(
          'Plan',
          account.account.data
        )
      })

      console.log('Plans for user:', plans)
      return plans
    } catch (error) {
      console.error('Failed to fetch plans for user:', error)
    }
  }

  // Replace with the public key of the user whose plans you want to fetch
  const userPublicKey = new PublicKey(
    '9amABYwZ73MtduGjWD3Ne3LUyf9PgCeK7nrnALX3KQM1'
  )
  // getPlansByUser(userPublicKey)

  const getPlanDetails = async (planPublicKey: PublicKey) => {
    const program = getProgram()

    try {
      // Fetch the Plan account details using its public key
      const planDetails = await program.account.plan.fetch(planPublicKey)

      console.log('Plan Details:', planDetails)
      return planDetails
    } catch (error) {
      console.error('Failed to fetch plan details:', error)
    }
  }

  // Replace with the actual public key of the Plan account you want to retrieve
  const planPublicKey = new PublicKey(
    'JDNYashDahXUSVvn1SUEa4QzPmByNtjq7SBa8iwb6Gjp'
  )
  getPlanDetails(planPublicKey)

  return (
    <div>
      <div className="lg:mb-0 lg:w-full lg:max-w-6xl lg:grid-cols-6 lg:text-left">
        <div className="mt-8">
          <div>
            <div className="mt-6 w-full space-y-10 sm:mt-8 lg:mt-0 lg:max-w-xs xl:max-w-md">
              <div className="flow-root"></div>

              <div className="space-y-3">
                {publicKey ? (
                  <button
                    onClick={() => handleCreatePlan()}
                    className="flex w-full items-center bg-green-700 justify-center rounded-lg  px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 focus:outline-none focus:ring-4  focus:ring-primary-300  dark:focus:ring-primary-800"
                  >
                    Enable account
                  </button>
                ) : (
                  <h1 className="text-center">Wallet is not connected</h1>
                )}
              </div>

              <div>Pricing:</div>
              <div>Every month price for client: 2$ || (2/Sol price)SOl</div>
              <div>
                Every secound price for client: 2$ || (2/Sol
                price)/(30*24*3600)SOl
                <div>
                  base on current sol price is $120 every secound use is
                  0.000000006SOL
                </div>
              </div>

              <div>
                Pricing for server: for every secound base on current price for
                client is: 0.000000006SOL*client_count*(current server live time
                per sec/ total server live time per sec)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
