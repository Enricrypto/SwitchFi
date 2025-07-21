import { arbitrum } from 'wagmi/chains';
import { injected } from '@wagmi/connectors';
import { createConfig } from 'wagmi';
import { http } from 'viem';

export const chains = [arbitrum];

const connectors = [injected()];

export const config = createConfig({
  chains: [arbitrum],
  connectors,
  transports: {
    [arbitrum.id]: http(
      'https://arb-mainnet.g.alchemy.com/v2/ADLPIIv6SUjhmaoJYxWLHKDUDaw8RnRj'
    ),
  },
});
