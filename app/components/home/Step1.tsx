import Image from 'next/image'
import solCoinImg from '../../../public/sol_coin.png'
export default function Step1({
  setStep
}: {
  setStep: (value: number) => void
}) {
  return (
    <div className="mt-10 text-center">
      <h1 className="text-4xl font-bold">3 Simple step to dive into web3</h1>
      <div className="mt-5 text-center text-2xl">
        Solana payment gateway for website.
      </div>
      <Image
        src={solCoinImg}
        width={300}
        height={300}
        className="mx-auto mt-10"
        alt="solana payment gateway"
      />

      <button
        className="mt-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded"
        onClick={() => setStep(2)} // Call the setStep function passed from the parent
      >
        Next step
      </button>
    </div>
  )
}
