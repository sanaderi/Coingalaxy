import Image from 'next/image'
import solCoinImg from '../../../public/sol_coin.png'
export default function Step3({
  setStep
}: {
  setStep: (value: number) => void
}) {
  return (
    <div className="mt-10 text-center">
      <h1 className="text-4xl font-bold">Everything is ready</h1>
      <div className="mt-5 text-center text-2xl">
        In your webapp first encrypt <br />
        <code>walletAddress, amount, orderId, callBackUrl</code>
        <br /> by your private key and finaly send like this object value:
        <br />
        yourEncryptedData, publicKey: yourPublicKey send request to
        https://coingalaxy.info/generatePay by POST and send
        <br />
        ,
        <br />
        <div>
          We generate a payment link and return to yourwebsite. redirect user to
          this link.
        </div>
        <div>After payment we return user to your callback url</div>
      </div>
    </div>
  )
}
