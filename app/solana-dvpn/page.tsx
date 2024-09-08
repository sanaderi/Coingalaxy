import Head from 'next/head'
import SubscribeCard from '../components/dvpn/SubscribeCard'
import Link from 'next/link'

export default async function DVPN() {
  return (
    <div className="w-full container px-2 my-10 ">
      <h1 className="text-center text-2xl font-bold mb-10">
        Solana DVPN Service
      </h1>
      <div className="w-full flex flex-col xs:flex-col sm:flex-row gap-4 justify-center items-center">
        <Link
          href="/solana-dvpn/client"
          className="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {`I'm client`}
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            You can from here recive server data and connect to it. in simple
            step
          </p>
        </Link>
        <Link
          href="/solana-dvpn/server"
          className="block max-w-sm  p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700"
        >
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Server owner
          </h5>
          <p className="font-normal text-gray-700 dark:text-gray-400">
            Very simple, in one step You can add your server here, config that
            and earn SOL
          </p>
        </Link>
      </div>
    </div>
  )
}
