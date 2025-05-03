module.exports = {
  apps: [
    {
      name: 'coingalaxy',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3006
      }
    }
  ]
}
