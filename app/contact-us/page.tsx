import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Coingalaxy | Contact us',
  description: 'Solana payment gateway'
}
export default async function ContactPage() {
  return (
    <div className="mt-10">
      <h1 className="text-2xl font-bold mb-4">Contact us</h1>
      <div className="text-xl">
        <span className="text-bold">Solana Dvpn Project:&nbsp;&nbsp;</span>
        <a
          href="https://x.com/solanadvpn"
          target="_blank"
          className="text-blue-500"
        >
          https://x.com/solanadvpn
        </a>
      </div>
    </div>
  )
}
