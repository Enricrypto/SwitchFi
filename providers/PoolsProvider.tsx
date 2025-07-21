'use client';

import { useEffect } from 'react';
import { usePoolsStore } from '../store/usePoolsStore';
import { usePublicClient } from 'wagmi';
import { useAccount } from 'wagmi';

function PoolsProvider() {
  const { address: userAddress } = useAccount();
  const publicClient = usePublicClient();

  const fetchAllPools = usePoolsStore((state) => state.fetchAllPools);
  const fetchUserPools = usePoolsStore((state) => state.fetchUserPools);

  useEffect(() => {
    if (!publicClient) return;

    fetchAllPools(publicClient);

    if (!userAddress) return;
    if (userAddress) {
      fetchUserPools(userAddress, publicClient);
    }
  }, [publicClient, userAddress, fetchAllPools, fetchUserPools]);

  return null; // this component just manages fetching in global state
}

export default PoolsProvider;
