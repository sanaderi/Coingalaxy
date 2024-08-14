"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL,Transaction, SystemProgram,PublicKey } from "@solana/web3.js";
import { useEffect, useState } from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
 
export default function Home() {
  const { connection } = useConnection();
  const { publicKey,sendTransaction } = useWallet();
  const [balance, setBalance] = useState<number>(0);


  useEffect(() => {
  if (publicKey) {
    (async function getBalanceEvery10Seconds() {
      const newBalance = await connection.getBalance(publicKey);
      setBalance(newBalance / LAMPORTS_PER_SOL);
      setTimeout(getBalanceEvery10Seconds, 10000);
    })();
  }
  }, [publicKey, connection, balance]);
  
  const getAirdropOnClick = async () => {
  try {
    if (!publicKey) {
      throw new Error("Wallet is not Connected");
    }
    const [latestBlockhash, signature] = await Promise.all([
      connection.getLatestBlockhash(),
      connection.requestAirdrop(publicKey, 1 * LAMPORTS_PER_SOL),
    ]);
    const sigResult = await connection.confirmTransaction(
      { signature, ...latestBlockhash },
      "confirmed",
    );
    if (sigResult) {
      alert("Airdrop was confirmed!");
    }
    } catch (err) {
    alert("You are Rate limited for Airdrop");
  }
  };


  const paySol = async (recipient: string) => {
    if (!publicKey) {
      alert("Wallet not connected!");
      return;
    }

    console.log(recipient)

    try {
      const recipientPublicKey = new PublicKey(recipient);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: recipientPublicKey,
          lamports: 0.4 * LAMPORTS_PER_SOL,
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, "finalized");

      const newBalance = await connection.getBalance(publicKey);
      setBalance(newBalance / LAMPORTS_PER_SOL);

      alert("Payment successful!");
    } catch (error:any) {
      if (error?.code === 4001) {
        // User rejected the transaction
        alert("Transaction was rejected by the user.");
      } else if (error?.message.includes("insufficient funds")) {
        // Not enough funds
        alert("Insufficient funds for transaction.");
      } else {
        console.error("Payment failed", error);
        alert("Payment failed! " + error.message);
      }
    }
  };
  return (
    <main className="flex items-center justify-center min-h-screen">
      <div className="border hover:border-slate-900 rounded " >
        <WalletMultiButton style={{}}  />
      </div>

      <div>
         {publicKey ? (
        <div className="flex flex-col gap-4">
          <h1>Your Public key is: {publicKey?.toString()}</h1>
          <h2>Your Balance is: {balance} SOL</h2>
          <div>
            <button
              onClick={getAirdropOnClick}
              type="button"
              className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
            >
              Get Airdrop
              </button>
              
               <button
                onClick={() => paySol("4dng5rCJWr5coZGyM9itEf963v65KCRgpRL5kqeAFFwp")}
                type="button"
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              >
                Pay 1 SOL
              </button>
          </div>
        </div>
      ) : (
        <h1>Wallet is not connected</h1>
      )}
      </div>
    </main>
  );
}