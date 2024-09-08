import Head from 'next/head'
import Link from 'next/link'
import ServerManage from '../../components/dvpn/SeverManage'

export default async function DVPN() {
  return (
    <div className="container mx-auto mt-10">
      <ServerManage />

      <div>
        Pricing for server: for every secound base on current price for client
        is: 0.000000006SOL*client_count*(current server live time per sec/ total
        server live time per sec)
      </div>
    </div>
  )
}