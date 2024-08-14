import AppWalletProvider from "./components/AppWalletProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
       <AppWalletProvider>{children}</AppWalletProvider>
      </body>
    </html>
  )
}