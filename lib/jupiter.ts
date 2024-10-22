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

const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL
if (!rpcUrl) throw new Error('Set rpc url')
const connection = new Connection(rpcUrl)
//Swap method

export const jupiterSwap = async (
  sourceToken: string,
  destinationToken: string,
  address: Array<number>
): Promise<string> => {
  console.log('Enter to swap')
  try {
    const secretKey = Uint8Array.from(address)
    const keypair = Keypair.fromSecretKey(secretKey)

    const amount = await getTokenBalance(
      keypair.publicKey.toBase58(),
      sourceToken
    )

    if (amount < 1) return 'insufficient_amount'
    const priorityVal = await calcPriorty()
    console.log('priority is: '+ priorityVal)
   
    // Step 1: Create swap request with slippage tolerance
    const quoteRequest = {
      amount: Math.floor(amount) * 10 ** 6,
      inputMint: sourceToken,
      outputMint: destinationToken,
      userPublicKey: keypair.publicKey.toBase58(), // User's public key
      wrapUnwrapSol: false,
      slippageBps: 300 // Add slippage tolerance here
    }

    // Step 2: Make API call to Jupiter
    const quoteResponse = await (
      await fetch(`https://api.jup.ag/swap/v6/quote?inputMint=${quoteRequest.inputMint}
&outputMint=${quoteRequest.outputMint}
&amount=${quoteRequest.amount}
&slippageBps=${quoteRequest.slippageBps}`)
    ).json()

    // Step 3: Get swap transaction from Jupiter
    const { swapTransaction } = await (
      await fetch('https://api.jup.ag/swap/v6/transaction', {
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
          // wrapAndUnwrapSol: true,
          dynamicSlippage: { maxBps: 300 },
          // dynamicComputeUnitLimit: true, // allow dynamic compute limit instead of max 1,400,000
          // custom priority fee
          prioritizationFeeLamports: priorityVal>1 ? priorityVal : 'auto' // or custom lamports: 1000

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
    const confirmResult = await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: txid
    })

    // if (confirmResult && confirmResult.value && confirmResult.value?.value?.err) {
      console.log(confirmResult.value)
      // return 'error'
    // }

    return 'success'
  } catch (error) {
    try {
      await fetch('https://coingalaxy.info/api/sendEmail', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subject: 'Error on swap',
          txt: `Error: ${error}`
        })
      })
    } catch (mail_error) {
      console.error(mail_error)
    }
    console.log(error)

    return 'error'
  }
}

const calcPriorty = async () => {
    let priorityValue=-1  
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')
    

    const raw = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'qn_estimatePriorityFees',
      params: {
        last_n_blocks: 100,
        account: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4'
      }
    })

    const requestOptions:RequestInit = {
      method: 'POST',
      headers: myHeaders,
      body: raw,
      redirect: 'follow'
    }

    await fetch(rpcUrl,requestOptions)
      .then((response) => response.json())
      .then((result) => {
        const priorityFee = result.result.per_transaction.high // Accessing priorityFees
        console.log(`calc fee is: ${priorityFee}`)
        priorityValue=priorityFee
      })
      .catch((error) => {
        priorityValue = -1
      })
  return priorityValue
 
}
