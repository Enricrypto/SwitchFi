// utils/getMockPrice.ts
export function getMockPrice(tokenSymbol: string): number {
  if (!tokenSymbol) return 1; // fallback

  const mockBase = tokenSymbol.charCodeAt(0); // use first letter
  return (mockBase % 500) + 1; // between 1–500
}
