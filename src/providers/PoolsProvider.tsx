'use client';

import { useEffect } from 'react';
import { usePoolsStore } from '../store/usePoolsStore';
import { useAccount } from 'wagmi';
import { publicClient } from '@/clients/viemClient';

function PoolsProvider() {
  const { address: userAddress } = useAccount();
  const fetchAllPools = usePoolsStore((state) => state.fetchAllPools);
  const fetchUserPools = usePoolsStore((state) => state.fetchUserPools);

  useEffect(() => {
    if (!publicClient) return;

    const loadPools = async () => {
      await fetchAllPools(publicClient);
      if (userAddress) {
        await fetchUserPools(userAddress, publicClient);
      }
    };

    loadPools();
  }, [userAddress, fetchAllPools, fetchUserPools]);

  return null; // this component just manages fetching in global state
}

export default PoolsProvider;
