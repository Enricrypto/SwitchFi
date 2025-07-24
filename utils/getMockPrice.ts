import pricesJson from '../mock-data/prices.json';

const prices: { [key: string]: number } = pricesJson;

export function getMockPrice(tokenSymbol: string): number | null {
  return prices[tokenSymbol] ?? null;
}
