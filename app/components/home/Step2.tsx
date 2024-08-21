import { useWallet } from '@solana/wallet-adapter-react'
import { z } from 'zod'

import { useEffect, useState } from 'react'

export default function Step1({
  setStep
}: {
  setStep: (value: number) => void
}) {
  const { publicKey } = useWallet()
  const [isLoading, setIsLoading] = useState(false)

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
            <div className='d-flex'>
              <button
              className="mt-10 bg-grey-500 hover:bg-grey-700 mr-2 text-white font-bold py-3 px-8 rounded"
              onClick={() => setStep(1)} // Call the setStep function passed from the parent
            >
              Prev step
            </button>
            <button
              className="mt-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded"
              onClick={() => setStep(3)} // Call the setStep function passed from the parent
            >
              Request to create
            </button>
              </div>
          </div>
        ) : (
          <h1>Wallet is not connected</h1>
        )}
      </div>
    </div>
  )
}
