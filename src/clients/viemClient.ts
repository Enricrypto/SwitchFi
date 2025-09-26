import { createPublicClient, http } from 'viem';
import { arbitrum } from 'viem/chains';

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

if (!alchemyApiKey) {
  throw new Error('NEXT_PUBLIC_ALCHEMY_API_KEY is not set in .env.local');
}

export const publicClient = createPublicClient({
  chain: arbitrum,
  transport: http(`https://arb-mainnet.g.alchemy.com/v2/${alchemyApiKey}`),
});
