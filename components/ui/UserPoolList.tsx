import PairAddress from './PairAddress';
import { PoolListProps } from '../../types/interfaces';
import Spinner from './Spinner';

const UserPoolList = ({
  pools,
  isLoading,
  onAddLiquidityClick,
  onRemoveLiquidityClick,
}: PoolListProps & { isLoading: boolean }) => {
  // ───── Show loading spinner and message while fetching pools ─────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Spinner />
        <p>Loading your pools...</p>
      </div>
    );
  }

  // ───── Show message when no pools are found for the user ─────
  if (!pools.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p>No pools found for your address.</p>
        <p>Try adding liquidity or visit the All Pools tab.</p>
      </div>
    );
  }

  // ───── Render grid of user pools with add/remove liquidity handlers ─────
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 m-16">
      {pools.map((pool) => (
        <PairAddress
          key={pool.pairAddress}
          {...pool}
          isUserPool
          onAddLiquidityClick={onAddLiquidityClick}
          onRemoveLiquidityClick={onRemoveLiquidityClick}
        />
      ))}
    </div>
  );
};

export default UserPoolList;
