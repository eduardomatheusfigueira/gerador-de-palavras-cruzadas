import type { GridCell } from '../types';

export const createCompactGrid = (
  grid: GridCell[][]
): { grid: GridCell[][]; rowOffset: number; colOffset: number } => {
  let minRow = grid.length,
    maxRow = -1,
    minCol = grid[0].length,
    maxCol = -1;

  grid.forEach((row, r) => {
    row.forEach((cell, c) => {
      if (!cell.isBlocker) {
        if (r < minRow) minRow = r;
        if (r > maxRow) maxRow = r;
        if (c < minCol) minCol = c;
        if (c > maxCol) maxCol = c;
      }
    });
  });

  if (maxRow === -1) {
    return { grid: [], rowOffset: 0, colOffset: 0 };
  }

  const compactGrid: GridCell[][] = [];
  for (let r = minRow; r <= maxRow; r++) {
    compactGrid.push(grid[r].slice(minCol, maxCol + 1));
  }

  return { grid: compactGrid, rowOffset: minRow, colOffset: minCol };
};
