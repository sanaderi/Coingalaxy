'use client'
import { z } from 'zod'
import { getProgram } from '@/utils/connectAnchorProgram' // Adjust the path as needed

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN, web3 } from '@project-serum/anchor' // Import BN
import { PublicKey } from '@solana/web3.js'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AnchorProvider, AnchorError, Wallet } from '@coral-xyz/anchor'
import { formatUTCDate } from '@/utils/formatUTCDate'
import { fetchJupiterPrice } from '@/lib/jupiter'
import { createRandomString } from '@/utils/createRandomString'
interface UsrPlans {
  owner: string
  expirationDate: string
  publicKey: string
  server: string
  username: string
}
export default function SubscribeCard() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const [isLoading, setIsLoading] = useState(false)
  const [listIsLoading, setListIsLoading] = useState(true)
  const [notice, setNotice] = useState({ msg: '', type: '' })
  const [serverDetails, setServerDetails] = useState({
    ip_address: '',
    connection_type: ''
  })

  const [userPlans, setUserPlans] = useState<Array<UsrPlans>>([])
  const [solPrice, setPriceData] = useState(0)

  useEffect(() => {
    async function getPrice() {
      const data = await fetchJupiterPrice('SOL') // Fetch SOL price as an example
      setPriceData(data.data.SOL.price)
    }

    getPrice()
  }, [])

  const dialogRef = useRef<HTMLDialogElement>(null)
  const openConfig = async (serverKey: string) => {
    const serverDetails = await getServerDetails(serverKey)
    if (serverDetails)
      setServerDetails({
        ip_address: serverDetails.ipAddress,
        connection_type: serverDetails.connectionType
      })
    dialogRef.current?.showModal()
  }

  const closeDialog = () => {
    dialogRef.current?.close()
  }

  const handleCreatePlan = async (expirationDate: number) => {
    setIsLoading(true)
    setNotice({ msg: '', type: '' })

    const randomServer = await selectRandomServer()

    if (!randomServer) {
      setNotice({ msg: 'Error finding server', type: 'err' })
      setIsLoading(false)
      return
    }

    try {
      const program = getProgram()
      const provider = program.provider as AnchorProvider

      // Generate a new keypair for the plan
      const plan = web3.Keypair.generate()

      // Create the PublicKey object using the buffer
      const SOL_PRICE_FEED_ID = new PublicKey(
        '7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE'
      )

      // Derive the PDA using the same seed
      const [pdaPublicKey, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from('payment')], // Ensure this matches the seed in your Rust program
        program.programId
      )

      //Generate random username
      const username = await createRandomString(8)

      // Call the `createPlan` instruction defined in the IDL
      await program.methods
        .createPlan(new BN(expirationDate), username)
        .accounts({
          plan: plan.publicKey,
          server: randomServer,
          user: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
          priceUpdate: SOL_PRICE_FEED_ID,
          pdaAccount: pdaPublicKey
        })
        .signers([plan])
        .rpc()
      setNotice({ msg: 'The purchase was made successfully', type: 'success' })

      getPlanDetails(plan.publicKey.toBase58())
      if (publicKey) {
        setListIsLoading(true)
        getPlansByUser(publicKey)
      }
    } catch (err) {
      if (err instanceof AnchorError) {
        setNotice({
          msg: err.error.errorMessage,
          type: 'err'
        })
      } else {
        setNotice({
          msg: `TransactionError: ${err}`,
          type: 'err'
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  //Random server for client
  const selectRandomServer = async () => {
    const program = getProgram()
    const servers = await program.account.server.all()
    if (servers.length > 0) {
      // Get a random index between 0 and servers.length - 1
      const randomIndex = Math.floor(Math.random() * servers.length)
      const randomServer = servers[randomIndex]

      return randomServer.publicKey
    } else {
      return false
    }
  }

  const getPlansByUser = useCallback(async (userPublicKey: PublicKey) => {
    const program = getProgram()

    try {
      // Fetch all accounts for the program where the owner is the user's public key
      const plans = await program.account.plan.all([
        {
          memcmp: {
            offset: 8, // Adjust based on where the owner field is in the Plan struct
            bytes: userPublicKey.toBase58()
          }
        }
      ])

      const plansArray = plans.map((plan) => ({
        owner: plan.account.owner.toBase58(), // Convert the owner publicKey to base58
        expirationDate: plan.account.expirationDate.toNumber(), // Convert i64 to JavaScript number
        publicKey: plan.publicKey.toBase58(),
        server: plan.account.server.toBase58(),
        username: plan.account.username
      }))

      setUserPlans(plansArray)
    } catch (error) {
      console.error('Failed to fetch plans for user:', error)
    } finally {
      setListIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (publicKey) {
      getPlansByUser(publicKey)
    }
  }, [publicKey, getPlansByUser])

  const getPlanDetails = async (key: string) => {
    const planPublicKey = new PublicKey(key)
    const program = getProgram()

    try {
      // Fetch the Plan account details using its public key
      const planDetails = await program.account.plan.fetch(planPublicKey)

      return planDetails
    } catch (error) {
      console.error('Failed to fetch plan details:', error)
    }
  }

  const getServerDetails = async (key: string) => {
    const serverPublicKey = new PublicKey(key)
    const program = getProgram()

    try {
      // Fetch the Server account details using its public key
      const serverDetails = await program.account.server.fetch(serverPublicKey)

      return serverDetails
    } catch (error) {
      return false
    }
  }

  return (
    <div>
      <div className="container">
        <div className="mt-8">
          <div>
            <div>
              <div className="flow-root"></div>

              <div>
                {publicKey ? (
                  <div className="w-full mb-10 mx-auto px-4">
                    <h1 className="text-2xl font-bold text-center mb-6">
                      Buy your plan now
                    </h1>
                    <p className="text-center mb-4 text-slate-100">
                      Under development, please switch wallet to dev mode
                    </p>

                    <div className="w-full flex flex-col xs:flex-col sm:flex-row gap-4 justify-center items-center">
                      <div className="card bg-neutral text-white-content w-full md:w-96">
                        <div className="card-body">
                          <h2 className="card-title">Monthly Plan</h2>
                          <p>Price is 2$ ≈ {(2 / solPrice).toFixed(4)} SOL</p>
                          <div className="card-actions justify-end">
                            <button
                              className="btn btn-outline"
                              onClick={() => handleCreatePlan(30)}
                            >
                              {!isLoading ? (
                                'Buy Now'
                              ) : (
                                <span className="loading loading-spinner loading-sm"></span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="card bg-neutral-content text-primary-content w-full md:w-96">
                        <div className="card-body">
                          <h2 className="card-title">Bi-Monthly Plan</h2>
                          <p>Price is 4$ ≈ {(4 / solPrice).toFixed(4)} SOL</p>
                          <div className="card-actions justify-end">
                            <button
                              className="btn "
                              onClick={() => handleCreatePlan(60)}
                            >
                              {!isLoading ? (
                                'Buy Now'
                              ) : (
                                <span className="loading loading-spinner loading-sm"></span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="card bg-amber-500 text-primary-content w-full md:w-96">
                        <div className="card-body">
                          <h2 className="card-title">Quarterly Plan</h2>
                          <p>Price is 6$ ≈ {(6 / solPrice).toFixed(4)} SOL</p>
                          <div className="card-actions justify-end">
                            <button
                              className="btn "
                              onClick={() => handleCreatePlan(90)}
                            >
                              {!isLoading ? (
                                'Buy Now'
                              ) : (
                                <span className="loading loading-spinner loading-sm"></span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p
                      className={`text-center mt-4 ${
                        notice?.type === 'err' ? 'text-error' : 'text-success'
                      }`}
                    >
                      {notice?.msg}
                    </p>

                    <h1 className="text-2xl font-bold text-center mt-16 mb-8">
                      Your plans
                    </h1>

                    {!listIsLoading ? (
                      userPlans.length === 0 ? (
                        <p className="text-center">No plans found</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full lg:w-1/2 table-auto mx-auto mb-14">
                            <thead>
                              <tr>
                                <th className="text-left">Username</th>
                                <th className="text-left">Expiry Date</th>
                                <th className="text-left">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userPlans.map((plan, index) => (
                                <tr key={index}>
                                  {/* <td className="py-1">{plan.publicKey}</td> */}
                                  <td className="py-1">{plan.username}</td>
                                  <td>
                                    {formatUTCDate(Number(plan.expirationDate))}
                                  </td>
                                  <td>
                                    <button
                                      onClick={() => openConfig(plan.server)}
                                      className="btn btn-outline btn-xs"
                                    >
                                      Config
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    ) : (
                      <div className="text-center">
                        <span className="loading loading-ball loading-sm " />
                        <span className="loading loading-ball loading-sm" />
                        <span className="loading loading-ball loading-md" />
                        <span className="loading loading-ball loading-lg" />
                      </div>
                    )}
                  </div>
                ) : (
                  <h1 className="text-center">Wallet is not connected</h1>
                )}
              </div>

              <dialog
                ref={dialogRef}
                className="modal"
              >
                <div className="modal-box">
                  <h3 className="text-lg font-bold mb-4">Server config</h3>
                  <table className="w-full  table-auto mx-auto mb-14">
                    <tbody>
                      <tr>
                        <td className="font-bold py-2">Server IP</td>
                        <td className="text-center">
                          {serverDetails.ip_address}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold py-2">Type</td>
                        <td className="text-center">
                          {serverDetails.connection_type}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold py-2">Password</td>
                        <td className="text-center">
                          <button className="btn btn-outline btn-xs btn-warning">
                            Show
                          </button>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold py-2">
                          Recommended App for Android
                        </td>
                        <td className="text-center">
                          <a
                            href="https://play.google.com/store/apps/details?id=com.napsternetlabs.napsternetv"
                            target="_blank"
                            className="btn btn-outline btn-xs btn-info"
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                      <tr>
                        <td className="font-bold">Recommended App for iOS</td>
                        <td className="text-center">
                          <a
                            href="https://apps.apple.com/us/app/npv-tunnel/id1629465476"
                            target="_blank"
                            className="btn btn-outline btn-xs btn-info"
                          >
                            Download
                          </a>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="modal-action">
                    <form method="dialog">
                      <button className="btn">Close</button>
                    </form>
                  </div>
                </div>
              </dialog>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
