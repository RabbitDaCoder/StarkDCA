import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  starknet: {
    rpcUrl: process.env.STARKNET_RPC_URL || 'https://starknet-sepolia.public.blastapi.io',
    contractAddress: process.env.DCA_CONTRACT_ADDRESS || '',
    executorPrivateKey: process.env.EXECUTOR_PRIVATE_KEY || '',
    executorAddress: process.env.EXECUTOR_ADDRESS || '',
  },

  price: {
    apiUrl: process.env.PRICE_API_URL || 'https://api.coingecko.com/api/v3',
    apiKey: process.env.PRICE_API_KEY || '',
  },

  cron: {
    schedule: process.env.DCA_CRON_SCHEDULE || '*/5 * * * *',
  },
} as const;
