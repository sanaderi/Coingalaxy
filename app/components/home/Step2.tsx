import { useWallet } from '@solana/wallet-adapter-react'
import { z } from 'zod'
import { useEffect, useState } from 'react'

export default function Step1({
  setStep
}: {
  setStep: (value: number) => void
}) {
  const [keys, setKeys] = useState<{
    publicKey: string
    privateKey: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { publicKey } = useWallet()
  const [responseMessage, setResponseMessage] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateKeys = async () => {
    setKeys({
      publicKey: '',
      privateKey: ''
    })
    setResponseMessage(null)
    setIsLoading(true)

    try {
      const response = await fetch('/api/generateKeys')
      const result = await response.json()

      if (result.success) {
        await handleSubmit(result.publicKey, result.privateKey)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (pbKey: string, pvKey: string) => {
    try {
      const response = await fetch('/api/setKeys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          wallet: publicKey,
          pbKey: pbKey,
          pvKey: pvKey
        })
      })

      const result = await response.json()
      if (result && result.result.insertedId) {
        setResponseMessage('Proccess successfully!')
        setKeys({
          publicKey: pbKey,
          privateKey: pvKey
        })
      } else {
        setResponseMessage(`Failed to proccess: ${result.error}`)
      }
    } catch (error) {
      setResponseMessage(`Error: ${(error as Error).message}`)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  return (
    <div className="mt-10 text-center">
      <h1 className="text-4xl font-bold">Give your private and public key</h1>
      <div className="mt-5 text-center ">
        {publicKey ? (
          <div className="flex flex-col ">
            {/* <h2>Wallet address: {PublicKey} </h2> */}
            <div>
              <div className="text-center">
                For use this service you need have your own keys
              </div>
            </div>
            <div>
              <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <h2 className="text-2xl font-bold">Public Key</h2>
                <pre className="bg-gray-100  text-gray-900 p-4 rounded">
                  {keys?.publicKey}
                </pre>
                <button
                  onClick={() => copyToClipboard(keys?.publicKey)}
                  className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Copy Public Key
                </button>
              </div>

              <div className="mb-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <h2 className="text-2xl font-bold">Private Key</h2>
                <pre className="bg-gray-100  text-gray-900 p-4 rounded">
                  {keys?.privateKey}
                </pre>
                <button
                  onClick={() => copyToClipboard(keys?.privateKey)}
                  className="mt-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Copy Private Key
                </button>
              </div>
            </div>
            <div className="d-flex">
              <button
                className="mt-10 bg-grey-500 hover:bg-grey-700 mr-2 text-white font-bold py-3 px-8 rounded"
                onClick={() => setStep(1)} // Call the setStep function passed from the parent
              >
                Prev step
              </button>
              {!keys?.publicKey ? (
                <button
                  className="mt-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded"
                  onClick={handleGenerateKeys} // Call the setStep function passed from the parent
                >
                  {isLoading ? 'Processing...' : `Request to create`}
                </button>
              ) : (
                <button
                  className="mt-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded"
                  onClick={() => setStep(3)} // Call the setStep function passed from the parent
                >
                  Next step
                </button>
              )}
            </div>
            <div className="mt-10">{responseMessage} </div>
          </div>
        ) : (
          <h1>Wallet is not connected</h1>
        )}
      </div>
    </div>
  )
}
