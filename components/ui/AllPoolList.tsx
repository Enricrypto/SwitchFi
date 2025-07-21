import PairAddress from './PairAddress';
import { PoolListProps } from '../../types/interfaces';
import Spinner from './Spinner';

const AllPoolList = ({
  pools,
  onAddLiquidityClick,
  onRemoveLiquidityClick,
}: PoolListProps) => {
  /** ------------------ Render Pool List ------------------ */
  if (!pools.length)
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    );

  // Map over each pool index and render a PairAddress component, passing required props
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 m-16">
      {pools.map((pool) => (
        <PairAddress
          key={pool.pairAddress}
          {...pool}
          onAddLiquidityClick={onAddLiquidityClick}
          onRemoveLiquidityClick={onRemoveLiquidityClick}
        />
      ))}
    </div>
  );
};

export default AllPoolList;
