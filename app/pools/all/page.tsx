'use client';

import PoolListContainer from '../../../components/containers/PoolListContainer';
import { usePoolsStore } from '../../../store/usePoolsStore';
import AllPoolList from '../../../components/ui/AllPoolList';

export default function AllPoolsPage() {
  const allPools = usePoolsStore((s) => s.allPools);
  return <PoolListContainer pools={allPools} ListComponent={AllPoolList} />;
}
