import { createPublicClient, http } from 'viem';
import { arbitrum } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: arbitrum,
  transport: http(
    `https://arb-mainnet.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY!}`
  ),
});
