'use client';

import PoolListContainer from '../../../components/containers/PoolListContainer';
import { usePoolsStore } from '../../../store/usePoolsStore';
import UserPoolList from '../../../components/ui/UserPoolList';

export default function UserPoolsPage() {
  const userPools = usePoolsStore((s) => s.userPools);
  const isLoadingUserPools = usePoolsStore((s) => s.isLoadingUserPools);

  return (
    <PoolListContainer
      pools={userPools}
      isLoading={isLoadingUserPools}
      ListComponent={UserPoolList}
    />
  );
}
