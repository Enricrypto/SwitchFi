'use client';

import Image from 'next/image';
import { useTokenListStore } from '../../store/useTokenListStore';

type Props = {
  address: string;
  size?: number;
};

const TokenIcon = ({ address, size = 24 }: Props) => {
  const { tokenList } = useTokenListStore();

  // ───── Find token data by matching address (case-insensitive) ─────
  const token = tokenList.find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );

  // ───── Fallback UI if token or logo is missing ─────
  if (!token || !token.logoURI)
    return <div className="w-6 h-6 bg-gray-200 rounded-full" />;

  // ───── Render token logo image ─────
  return (
    <Image
      src={token.logoURI}
      alt={token.symbol}
      width={size}
      height={size}
      className="rounded-full"
    />
  );
};

export default TokenIcon;
