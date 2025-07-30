import { useMemo } from 'react';
import { Address } from 'viem';
import { usePoolsStore } from '../store/usePoolsStore';

/**
 * Finds the shortest path from tokenIn to tokenOut based on available pools.
 * Supports direct, one-hop, and multi-hop paths using BFS.
 */
export function useBestPath(
  tokenIn?: Address,
  tokenOut?: Address
): Address[] | null {
  // ───── Fetch all pools from Zustand store ─────
  const allPools = usePoolsStore((state) => state.allPools);

  return useMemo(() => {
    // ───── Return null if inputs invalid or identical ─────
    if (!tokenIn || !tokenOut || tokenIn === tokenOut) return null;

    // ───── Build adjacency graph of tokens connected by pools ─────
    const graph: Record<Address, Set<Address>> = {};

    for (const pool of allPools) {
      const [a, b] = [pool.token0, pool.token1];

      if (!graph[a]) graph[a] = new Set();
      if (!graph[b]) graph[b] = new Set();

      graph[a].add(b);
      graph[b].add(a);
    }

    // ───── Breadth-First Search (BFS) to find shortest path ─────
    const visited = new Set<Address>();
    const queue: { path: Address[]; current: Address }[] = [
      { path: [tokenIn], current: tokenIn },
    ];

    while (queue.length > 0) {
      const { path, current } = queue.shift()!;

      // ───── If target token found, return path ─────
      if (current === tokenOut) return path;

      visited.add(current);

      // ───── Add neighbors to queue if not visited ─────
      for (const neighbor of graph[current] ?? []) {
        if (!visited.has(neighbor)) {
          queue.push({
            path: [...path, neighbor],
            current: neighbor,
          });
        }
      }
    }

    // ───── Return null if no path found ─────
    return null;
  }, [tokenIn, tokenOut, allPools]);
}
