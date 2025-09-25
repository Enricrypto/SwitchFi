'use client';

import PoolListContainer from '../../../components/pools/PoolListContainer';
import { usePoolsStore } from '../../../store/usePoolsStore';
import AllPoolList from '../../../components/pools/AllPoolList';

export default function AllPoolsPage() {
  const allPools = usePoolsStore((s) => s.allPools);
  return <PoolListContainer pools={allPools} ListComponent={AllPoolList} />;
}
