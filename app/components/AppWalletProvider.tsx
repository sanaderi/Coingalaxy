'use client'

import React, { useMemo } from 'react'
import {
  ConnectionProvider,
  WalletProvider
} from '@solana/wallet-adapter-react'

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'

import { clusterApiUrl } from '@solana/web3.js'

// import { UnsafeBurnerWalletAdapter } from "@solana/wallet-adapter-wallets";

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css')

export default function AppWalletProvider({
  children
}: {
  children: React.ReactNode
}) {
  const networkEnv = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'Devnet'

  // Map environment variable to WalletAdapterNetwork
  const network = useMemo(() => {
    switch (networkEnv.toLowerCase()) {
      case 'testnet':
        return WalletAdapterNetwork.Testnet
      case 'mainnet':
        return WalletAdapterNetwork.Mainnet
      case 'devnet':
      default:
        return WalletAdapterNetwork.Devnet
    }
  }, [networkEnv])

  const rpcURL =
    process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com/'
  const endpoint = useMemo(() => rpcURL, [network])
  const wallets = useMemo(
    () => [
      // manually add any legacy wallet adapters here
      // new UnsafeBurnerWalletAdapter(),
    ],
    [network]
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider
        wallets={wallets}
        autoConnect
      >
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
