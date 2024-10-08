import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coingalaxy | Donate',
  description: 'Solana payment gateway'
}
export default async function DonatePage() {
  return (
    <div className="mt-10">
      <h1 className="text-2xl font-bold mb-4">Donate</h1>
      <div className="text-xl">
        <span className="text-bold">
          You can help boost the development of the DVPN project by sending
          assets to:&nbsp;&nbsp;
          <br />
          FsLBoaLm5A385KM6jPRVCuSqEU5DVu4XYSkTM6YNfZjY Solana Wallet Address
        </span>
      </div>
    </div>
  )
}
