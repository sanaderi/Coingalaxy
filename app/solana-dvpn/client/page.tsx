import Head from 'next/head'
import SubscribeCard from '../../components/dvpn/SubscribeCard'
import Link from 'next/link'
import type { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Coingalaxy | Solana DVPN Service',
  description: 'Solana DVPN Service'
}

export default async function DVPN() {
  return (
    <div className="container mx-auto mt-10">
      <SubscribeCard />
    </div>
  )
}
