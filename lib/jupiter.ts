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
