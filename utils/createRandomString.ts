export const createRandomString = async (randomLength:number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''

  for (let i = 0; i < randomLength; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length)
    randomString += chars[randomIndex]
  }

  return randomString
}
