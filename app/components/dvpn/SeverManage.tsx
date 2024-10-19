'use client'
import { getProgram } from '@/utils/connectAnchorProgram' // Adjust the path as needed

import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { BN, web3 } from '@project-serum/anchor' // Import BN
import { PublicKey } from '@solana/web3.js'

import { useEffect, useState, useCallback, useRef } from 'react'
import { AnchorProvider, AnchorError } from '@coral-xyz/anchor'
import { ipSchema, portSchema } from '@/utils/validationSchemas'
interface UsrServers {
  owner: string
  ipAddress: string
  portNum: string
  connectionType: string
  publicKey: string
  clientCount: Number
}
export default function SubscribeCard() {
  const { connection } = useConnection()
  const { publicKey } = useWallet()

  const [isLoading, setIsLoading] = useState(false)
  const [listIsLoading, setListIsLoading] = useState(true)
  const [serverConfigHelp, setServerConfigHelp] = useState(false)
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
    setServerConfigHelp(false)
    let serverStatus = await checkServerStatus()
    if (!serverStatus) {
      setNotice({
        msg: 'Your server config has issue, please read document',
        type: 'err'
      })
      setServerConfigHelp(true)
      setIsLoading(false)
      return
    }

    try {
      const program = getProgram()
      const provider = program.provider as AnchorProvider

      // Generate a new keypair for the server
      const server = web3.Keypair.generate()

      // Call the `createServer` instruction defined in the IDL
      await program.methods
        .createServer(ipAddress, portNum, connectionType)
        .accounts({
          server: server.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId
        })
        .signers([server])
        .rpc()

      setNotice({ msg: 'Server submited successfully', type: 'success' })
      // getServerDetails(server.publicKey.toBase58())
      if (publicKey) {
        setListIsLoading(true)
        getServerList(publicKey)
      }
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

  const claimIncome = async (serverAddress: string) => {
    try {
      const program = getProgram()
      const provider = program.provider as AnchorProvider

      // Derive the PDA using the same seed
      const [pdaPublicKey, bump] = await PublicKey.findProgramAddressSync(
        [Buffer.from('payment')], // Ensure this matches the seed in your Rust program
        program.programId
      )

      // Call the `createServer` instruction defined in the IDL
      await program.methods
        .claimIncome()
        .accounts({
          server: serverAddress,
          user: provider.wallet.publicKey,
          systemProgram: web3.SystemProgram.programId,
          pdaAccount: pdaPublicKey
        })
        .rpc()

      // setNotice({ msg: 'Server submited successfully', type: 'success' })
      // getServerDetails(server.publicKey.toBase58())
      if (publicKey) {
        setListIsLoading(true)
        getServerList(publicKey)
      }
    } catch (err) {
      if (err instanceof AnchorError) {
        // setNotice({ msg: err.error.errorMessage, type: 'err' })
      } else {
        // setNotice({ msg: `TransactionError: ${err}`, type: 'err' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  //Check server config
  const checkServerStatus = async () => {
    try {
      const response = await fetch(`/api/proxy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ip_address: ipAddress
        })
      })
      return response.status === 200 ? true : false
    } catch {
      return false
    }
  }

  const getServerList = useCallback(async (userPublicKey: PublicKey) => {
    const program = getProgram()

    try {
      // Fetch all accounts for the program where the owner is the user's public key
      const servers = await program.account.server.all([
        {
          memcmp: {
            offset: 8, // Adjust based on where the owner field is in the Plan struct
            bytes: userPublicKey.toBase58()
          }
        }
      ])

      const serversArray = servers.map((plan) => ({
        owner: plan.account.owner.toBase58(), // Convert the owner publicKey to base58
        ipAddress: plan.account.ipAddress,
        portNum: plan.account.portNum,
        connectionType: plan.account.connectionType,
        clientCount: plan.account.clientCount,
        publicKey: plan.publicKey.toBase58()
      }))

      setActiveServers(serversArray)
    } catch (error) {
      console.error('Failed to fetch servers for user:', error)
    } finally {
      setListIsLoading(false)
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

                    {/* Set server help */}
                    {serverConfigHelp ? (
                      <div className="w-full lg:w-[90%] xl:w-1/2 mx-auto text-center mt-10">
                        <h2 className="text-xl font-bold text-center mb-6">
                          To Config server follow this step:
                        </h2>
                        <div className="mockup-code text-left">
                          <pre data-prefix="$">
                            <code>
                              mkdir DVPN && cd DVPN && git init && git
                              sparse-checkout init --cone && git sparse-checkout
                              set dvpn-server
                            </code>
                          </pre>
                        </div>
                        <div className="text-left my-5">Then</div>
                        <div className="mockup-code text-left">
                          <pre data-prefix="$">
                            <code>
                              git pull
                              https://github.com/sanaderi/Solana-DVPN.git main
                            </code>
                          </pre>
                        </div>
                        <div className="text-left my-5">Then</div>
                        <div className="mockup-code text-left">
                          <pre data-prefix="$">
                            <code>cd dvpn-server && ./install.sh</code>
                          </pre>
                        </div>
                        <div className="text-left my-5">
                          This creates a service to communicate between the
                          server and the VPN program.
                        </div>
                      </div>
                    ) : (
                      ''
                    )}
                    {/* End set server help */}

                    <h1 className="text-2xl font-bold text-center mt-16 mb-8">
                      Your servers
                    </h1>
                    {!listIsLoading ? (
                      activeServers.length === 0 ? (
                        <p className="text-center">No servers found</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full lg:w-1/2 table-auto mx-auto mb-14">
                            <thead>
                              <tr>
                                <th className="text-left">IP Address</th>
                                <th className="text-left">Port</th>
                                <th className="text-left">Type</th>
                                <th className="text-center">Client count</th>
                                <th className="text-center">Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {activeServers.map((server, index) => (
                                <tr key={index}>
                                  {/* <td>{server.publicKey.toString()}</td> */}
                                  <td className="py-1">
                                    {server.ipAddress.toString()}
                                  </td>
                                  <td>{server.portNum.toString()}</td>
                                  <td>{server.connectionType}</td>
                                  <td className="text-center">
                                    {server.clientCount.toString()}
                                  </td>
                                  <td className="text-center">
                                    <button
                                      onClick={() =>
                                        claimIncome(server.publicKey)
                                      }
                                      className="btn btn-outline btn-xs btn-success "
                                    >
                                      Claim Income
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
