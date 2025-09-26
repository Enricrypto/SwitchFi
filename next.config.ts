import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's2.coinmarketcap.com', // ✅ CoinMarketCap
      },
      {
        protocol: 'https',
        hostname: 'etherscan.io', // ✅ Etherscan
      },
      {
        protocol: 'https',
        hostname: 'assets.coingecko.com', // ✅ Coingecko
      },
    ],
  },
};

export default nextConfig;
