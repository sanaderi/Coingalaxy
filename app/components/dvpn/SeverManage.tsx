'use client'
import { getProgram } from '@/utils/connectAnchorProgram' // Adjust the path as needed

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN, web3 } from '@project-serum/anchor' // Import BN
import { PublicKey } from '@solana/web3.js'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AnchorProvider, AnchorError, Wallet } from '@coral-xyz/anchor'
import { formatUTCDate } from '@/utils/formatUTCDate'
import { fetchJupiterPrice } from '@/lib/jupiter'
import { ipSchema, portSchema } from '@/utils/validationSchemas'
interface UsrServers {
  owner: string
  ipAddress: string
  portNumber: string
  connectionType: string
  publicKey: string
}
export default function SubscribeCard() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const [isLoading, setIsLoading] = useState(false)
  const [activeServers, setActiveServers] = useState<Array<UsrServers>>([])
  const [ipAddress, setIpAddress] = useState('')
  const [portNum, setPortNum] = useState('')
  const [connectionType, setConnectionType] = useState('ssht')
  const [notice, setNotice] = useState({ msg: '', type: '' })

  const dialogRef = useRef(null)

  const handleSubmitServer = async () => {
    // Validate the IP address using Zod schema
    const ipValidationResult = ipSchema.safeParse(ipAddress)
    const portValidationResult = portSchema.safeParse(Number(portNum))

    if (ipValidationResult.success) {
      // Clear error and proceed with the valid IP address
      setNotice({ msg: '', type: '' })
    } else {
      // Set error message if validation fails
      setNotice({
        msg: ipValidationResult.error.errors[0].message,
        type: 'err'
      })
      return
    }

    if (portValidationResult.success) {
      // Clear error and proceed with the valid IP address
      setNotice({ msg: '', type: '' })
    } else {
      // Set error message if validation fails
      setNotice({
        msg: portValidationResult.error.errors[0].message,
        type: 'err'
      })
      return
    }
    // return
    setIsLoading(true)
    try {
      const program = getProgram()
      const provider = program.provider as AnchorProvider

      // Generate a new keypair for the server
      const server = web3.Keypair.generate()

      // Derive the PDA using the same seed
      const [pdaPublicKey, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from('payment')], // Ensure this matches the seed in your Rust program
        program.programId
      )

      // Call the `createServer` instruction defined in the IDL
      await program.rpc.createServer(ipAddress, portNum, connectionType, {
        accounts: {
          server: server.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
        },
        signers: [server]
      })
      setNotice({ msg: 'Server submited successfully', type: 'success' })
      // getServerDetails(server.publicKey.toBase58())
    } catch (err) {
      if (err instanceof AnchorError) {
        setNotice({ msg: err.error.errorMessage, type: 'err' })
      } else {
        setNotice({ msg: `TransactionError: ${err}`, type: 'err' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getServerList = useCallback(async (userPublicKey: PublicKey) => {
    const program = getProgram()

    try {
      // Fetch all accounts for the program where the owner is the user's public key
      const accounts = await connection.getProgramAccounts(program.programId, {
        filters: [
          {
            memcmp: {
              offset: 8, // Adjust based on where the owner field is in the Server struct
              bytes: userPublicKey.toBase58()
            }
          }
        ]
      })

      // Decode each account data to get the server details
      const servers = accounts.map((account) => {
        // Decode server data
        const decodedServer = program.account.server.coder.accounts.decode(
          'Server',
          account.account.data
        )

        console.log('Decoded Server Data:', decodedServer)

        return {
          publicKey: account.pubkey.toBase58(), // Convert publicKey to a string
          ...decodedServer // Spread the decoded server data into the object
        }
      })

      console.log('Servers:', servers)
      setActiveServers(servers)
    } catch (error) {
      console.error('Failed to fetch servers for user:', error)
    }
  }, [])

  useEffect(() => {
    if (publicKey) {
      getServerList(publicKey)
    }
  }, [publicKey, getServerList])

  const getServerDetails = async (key: string) => {
    const serverPublicKey = new PublicKey(key)
    const program = getProgram()

    try {
      // Fetch the Server account details using its public key
      const serverDetails = await program.account.server.fetch(serverPublicKey)

      console.log('Server Details:', serverDetails)
      console.log('Ip address:', serverDetails.ipAddress)
      console.log('Port Num:', serverDetails.portNum)
      console.log('Connection Type:', serverDetails.connectionType)

      return serverDetails
    } catch (error) {
      console.error('Failed to fetch server details:', error)
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
                      Submit your server
                    </h1>
                    <p className="text-center mb-4 text-slate-100">
                      Under development, please switch wallet to dev mode
                    </p>

                    <div className="w-full flex flex-col xs:flex-col md:flex-row gap-4 justify-center items-center">
                      <input
                        type="text"
                        value={ipAddress}
                        onChange={(e) => setIpAddress(e.target.value)}
                        placeholder="IP Address"
                        className="input input-bordered w-full md:max-w-xs"
                      />
                      <input
                        type="text"
                        value={portNum}
                        onChange={(e) => setPortNum(e.target.value)}
                        placeholder="Port"
                        className="input input-bordered w-full md:max-w-20"
                      />
                      <select
                        onChange={(e) => setConnectionType(e.target.value)}
                        className="select select-bordered w-full md:max-w-40"
                      >
                        <option value="ssht">SSH Tunnel</option>
                      </select>
                      <button
                        onClick={() => handleSubmitServer()}
                        className="btn btn-primary w-full md:max-w-40"
                      >
                        {!isLoading ? (
                          'Submit'
                        ) : (
                          <span className="loading loading-spinner loading-sm"></span>
                        )}
                      </button>
                    </div>
                    <p
                      className={`text-center mt-4 ${
                        notice.type === 'err' ? 'text-error' : 'text-success'
                      }`}
                    >
                      {notice?.msg}
                    </p>

                    <h1 className="text-2xl font-bold text-center mt-16 mb-8">
                      Your servers
                    </h1>
                    {activeServers.length === 0 ? (
                      <p className="text-center">No servers found</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full lg:w-1/2 table-auto mx-auto mb-14">
                          <thead>
                            <tr>
                              <th className="text-left">IP Address</th>
                              <th className="text-left">Port</th>
                              <th className="text-left">Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeServers.map((server, index) => (
                              <tr key={index}>
                                <td className="py-1">
                                  {server.ipAddress.toString()}
                                </td>
                                <td>{server.portNumber.toString()}</td>
                                <td>{server.connectionType}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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
                  <h3 className="text-lg font-bold">Server config</h3>
                  <p className="py-4">
                    This section is under development (Generate random user,
                    pass for random server is stored in account creation
                    proccess and set in destination server (if exists delete and
                    recreate username)) for change server need to new sign
                    transaction , Press ESC key or click the button below to
                    close
                  </p>
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
