import Head from 'next/head'
import SubscribeCard from '../../components/dvpn/SubscribeCard'
import Link from 'next/link'

export default async function DVPN() {
  return (
    <div className="container mx-auto mt-10">
      <SubscribeCard />
    </div>
  )
}
