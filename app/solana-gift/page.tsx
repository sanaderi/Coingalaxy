import Link from 'next/link'

export default function Gift() {
  return (
    <div className="w-full container px-2 my-10 ">
      <h1 className="text-center text-2xl font-bold mb-4">Solana Gift</h1>
      <p className="text-center mb-4 text-slate-100">
        Under development, please switch wallet to dev mode
      </p>
      <div className="w-full flex flex-col xs:flex-col sm:flex-row gap-4 justify-center items-center">
        <Link
          href="/solana-gift/order"
          className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {`Solana Gift Order`}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Give a Gift, Level Up your security in transfer asset and etc
          </p>
        </Link>
        <Link
          href="/solana-gift/withdraw"
          className="block max-w-sm  p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            I have a Solana Gift
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Use your Gift and recieve your asset, only in one step
          </p>
        </Link>
      </div>
    </div>
  )
}
