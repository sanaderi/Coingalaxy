import Head from 'next/head'
import Link from 'next/link'

export default async function DVPN() {
  return (
    <div className="container mx-auto mt-10">
      <div>Pricing:</div>
      <div>Every month price for client: 2$ || (2/Sol price)SOl</div>
      <div>
        Every secound price for client: 2$ || (2/Sol price)/(30*24*3600)SOl
        <div>
          base on current sol price is $120 every secound use is 0.000000006SOL
        </div>
      </div>

      <div>
        Pricing for server: for every secound base on current price for client
        is: 0.000000006SOL*client_count*(current server live time per sec/ total
        server live time per sec)
      </div>
    </div>
  )
}
