import PairAddress from './PairAddress';
import { PoolListProps } from '../../types/interfaces';
import Spinner from './Spinner';

const UserPoolList = ({
  pools,
  isLoading,
  onAddLiquidityClick,
  onRemoveLiquidityClick,
}: PoolListProps & { isLoading: boolean }) => {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <Spinner />
        <p>Loading your pools...</p>
      </div>
    );
  }

  if (!pools.length) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <p>No pools found for your address.</p>
        <p>Try adding liquidity or visit the All Pools tab.</p>
      </div>
    );
  }

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
