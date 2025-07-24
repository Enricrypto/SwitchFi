import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { arbitrum } from 'wagmi/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'My DEX',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [arbitrum],
  transports: {
    [arbitrum.id]: http(),
  },
  ssr: true, // optional, depends on your use case
});
