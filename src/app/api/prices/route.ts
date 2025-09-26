import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address'); // single token

  if (!address) {
    return NextResponse.json({ error: 'No address provided' }, { status: 400 });
  }

  const normalizedAddress = address.toLowerCase();
  let price: number | null = null;
  let error: string | undefined;

  try {
    const url = `https://api.coingecko.com/api/v3/simple/token_price/arbitrum-one?contract_addresses=${normalizedAddress}&vs_currencies=usd`;
    const res = await axios.get(url);

    if (
      res.data?.[normalizedAddress]?.usd !== undefined &&
      typeof res.data[normalizedAddress].usd === 'number'
    ) {
      price = res.data[normalizedAddress].usd;
    } else {
      error = 'No price available on CoinGecko';
      console.warn(`No price found on CoinGecko for ${normalizedAddress}`);
    }
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      error = `Axios error: ${err.message}`;
    } else if (err instanceof Error) {
      error = err.message;
    } else {
      error = 'Unknown error';
    }
    console.warn(`Error fetching price for ${normalizedAddress}: ${error}`);
  }

  return NextResponse.json({ [normalizedAddress]: price, error });
}
