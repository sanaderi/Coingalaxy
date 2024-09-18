export const fetchJupiterPrice = async (tokenSymbol: string) => {
  try {
    const response = await fetch(
      `https://price.jup.ag/v6/price?ids=${tokenSymbol}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch token price')
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('Error fetching price:', error)
    return null
  }
}

import { getTokenBalance } from '@/utils/splTokenBalance'
import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js'
// Replace with your actual Keypair

const connection = new Connection(
  'https://capable-quaint-seed.solana-mainnet.quiknode.pro/174112d03c630343f0f4c5e65497491d319897c6/'
)
export const jupiterSwap = async (
  sourceToken: string,
  destinationToken: string,
  address: Array<number>,
  retryCount = 0 // Add retryCount parameter to keep track of retry attempts
): Promise<string> => {
  const MAX_RETRIES = 3 // Maximum number of retries
  const RETRY_DELAY = 30000 // Delay between retries in milliseconds (30 seconds)

  try {
    const secretKey = Uint8Array.from(address)
    const keypair = Keypair.fromSecretKey(secretKey)

    const amount = await getTokenBalance(
      keypair.publicKey.toBase58(),
      sourceToken
    )

    // Step 1: Create swap request with slippage tolerance
    const quoteRequest = {
      amount: Math.floor(amount) * 10 ** 6,
      inputMint: sourceToken,
      outputMint: destinationToken,
      userPublicKey: keypair.publicKey.toBase58(), // User's public key
      wrapUnwrapSol: false,
      slippageBps: 50 // Add slippage tolerance here
    }

    // Step 2: Make API call to Jupiter
    const quoteResponse = await (
      await fetch(`https://quote-api.jup.ag/v6/quote?inputMint=${quoteRequest.inputMint}
&outputMint=${quoteRequest.outputMint}
&amount=${quoteRequest.amount}
&slippageBps=${quoteRequest.slippageBps}`)
    ).json()

    // Step 3: Get swap transaction from Jupiter
    const { swapTransaction } = await (
      await fetch('https://quote-api.jup.ag/v6/swap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // quoteResponse from /quote api
          quoteResponse,
          // user public key to be used for the swap
          userPublicKey: quoteRequest.userPublicKey,
          // auto wrap and unwrap SOL. default is true
          wrapAndUnwrapSol: true
          // feeAccount is optional. Use if you want to charge a fee.  feeBps must have been passed in /quote API.
          // feeAccount: "fee_account_public_key"
        })
      })
    ).json()

    // Step 4: Create transaction from base64
    // deserialize the transaction
    const swapTransactionBuf = Buffer.from(swapTransaction, 'base64')
    var transaction = VersionedTransaction.deserialize(swapTransactionBuf)

    // Step 5: Sign transaction with keypair
    transaction.sign([keypair])

    // Step 6: Send signed transaction to Solana network
    const latestBlockHash = await connection.getLatestBlockhash()

    // Execute the transaction
    const rawTransaction = transaction.serialize()
    const txid = await connection.sendRawTransaction(rawTransaction, {
      skipPreflight: true,
      maxRetries: 4
    })
    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: txid
    })

    return `https://solscan.io/tx/${txid}`
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying operation... (${retryCount + 1}/${MAX_RETRIES})`)
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return jupiterSwap(sourceToken, destinationToken, address, retryCount + 1) // Recursive call with incremented retry count
    } else {
      console.error('Error performing swap after retries:', error)
      return 'error'
    }
  }
}
