import { Connection, PublicKey } from '@solana/web3.js'
import { TOKEN_PROGRAM_ID, AccountLayout } from '@solana/spl-token'

// Solana mainnet endpoint
const connection = new Connection(
  'https://capable-quaint-seed.solana-mainnet.quiknode.pro/174112d03c630343f0f4c5e65497491d319897c6/'
)

export const getTokenBalance = async (
  walletAddress: string,
  mintString: string
) => {
  try {
    // TOKEN Token Mint Address on Solana mainnet
    const mintAddress = new PublicKey(mintString)

    // Fetch all token accounts for the wallet address
    const response = await connection.getTokenAccountsByOwner(
      new PublicKey(walletAddress),
      { programId: TOKEN_PROGRAM_ID }
    )

    // Loop through the accounts to find the TOKEN token account
    let balance = 0
    response.value.forEach((accountInfo) => {
      const accountData = AccountLayout.decode(accountInfo.account.data)

      // Check if the token account matches Token's mint address
      if (
        new PublicKey(accountData.mint).toBase58() === mintAddress.toBase58()
      ) {
        balance = Number(accountData.amount) //  balance in lamports (smallest unit)
      }
    })

    // TOKEN uses 6 decimal places, so convert lamports to actual TOKEN amount
    return balance / Math.pow(10, 6)
  } catch (error) {
    console.error('Error fetching TOKEN balance:', error)
    return 0
  }
}
