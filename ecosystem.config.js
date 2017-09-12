module.exports = {
  apps: [
    {
      name: 'bbbot',
      script: './bot.js',
      port: 3000,
      env: { NODE_ENV: 'development' }
    }
  ]
};
