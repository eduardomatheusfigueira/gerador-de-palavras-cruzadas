
import React, { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import type { GridCell, ValidationState } from '../types';

interface PlayerGridProps {
  grid: GridCell[][];
  playerGrid: (string | null)[][];
  validationGrid: ValidationState[][];
  activeCell: { row: number; col: number } | null;
  direction: 'across' | 'down';
  isGameOver?: boolean;
  onCellClick: (row: number, col: number) => void;
  onGridChange: (newGrid: (string | null)[][]) => void;
  onDirectionChange: (newDirection: 'across' | 'down') => void;
  onSetActiveCell: (newCell: { row: number; col: number }) => void;
}

const PlayerGrid = forwardRef<HTMLDivElement, PlayerGridProps>(({
  grid,
  playerGrid,
  validationGrid,
  activeCell,
  direction,
  isGameOver,
  onCellClick,
  onGridChange,
  onDirectionChange,
  onSetActiveCell
}, ref) => {
    
  const containerRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => containerRef.current!);

  const gridSize = grid.length;

  useEffect(() => {
    if (activeCell) {
      // Small timeout helps ensure virtual keyboard is triggered on mobile browsers
      const timer = setTimeout(() => hiddenInputRef.current?.focus(), 50);
      return () => clearTimeout(timer);
    }
  }, [activeCell]);

  const getNextCell = (row: number, col: number, dir: 'across' | 'down') => {
    let r = row;
    let c = col;
    do {
      if (dir === 'across') c++; else r++;
      if (r >= gridSize || c >= gridSize) return null;
    } while (grid[r][c].isBlocker);
    return { row: r, col: c };
  };

  const getPrevCell = (row: number, col: number, dir: 'across' | 'down') => {
    let r = row;
    let c = col;
    do {
      if (dir === 'across') c--; else r--;
      if (r < 0 || c < 0) return null;
    } while (grid[r][c].isBlocker);
    return { row: r, col: c };
  };
  
  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    if (!activeCell || isGameOver) return;
    const target = e.target as HTMLInputElement;
    const value = target.value;
    
    if (value) {
      const char = value.slice(-1).toUpperCase();
      if (/^[A-Z]$/.test(char)) {
        const { row, col } = activeCell;
        const newGrid = [...playerGrid.map(r => [...r])];
        newGrid[row][col] = char;
        onGridChange(newGrid);

        const nextCell = getNextCell(row, col, direction);
        if (nextCell) onSetActiveCell(nextCell);
      }
    }
    target.value = '';
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!activeCell || isGameOver) return;
    const { row, col } = activeCell;

    let nextCell: {row: number, col: number} | null;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (direction === 'across') onDirectionChange('down');
        nextCell = getPrevCell(row, col, 'down');
        if(nextCell) onSetActiveCell(nextCell);
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (direction === 'across') onDirectionChange('down');
        nextCell = getNextCell(row, col, 'down');
        if(nextCell) onSetActiveCell(nextCell);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (direction === 'down') onDirectionChange('across');
        nextCell = getPrevCell(row, col, 'across');
        if(nextCell) onSetActiveCell(nextCell);
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (direction === 'down') onDirectionChange('across');
        nextCell = getNextCell(row, col, 'across');
        if(nextCell) onSetActiveCell(nextCell);
        break;
      case 'Backspace':
        e.preventDefault();
        const newGrid = [...playerGrid.map(r => [...r])];
        if (newGrid[row][col] === null || newGrid[row][col] === '') {
          const prevCell = getPrevCell(row, col, direction);
          if (prevCell) {
            newGrid[prevCell.row][prevCell.col] = '';
            onGridChange(newGrid);
            onSetActiveCell(prevCell);
          }
        } else {
          newGrid[row][col] = '';
          onGridChange(newGrid);
        }
        break;
      case ' ':
      case 'Enter':
        e.preventDefault();
        onDirectionChange(direction === 'across' ? 'down' : 'across');
        break;
      default:
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative bg-white p-2 sm:p-4 rounded-lg shadow-lg aspect-square w-full max-w-[700px] mx-auto"
      onClick={() => hiddenInputRef.current?.focus()}
    >
        <input
            ref={hiddenInputRef}
            type="text"
            className="absolute w-0 h-0 opacity-0 -z-10"
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck="false"
        />
      <div
        className="grid bg-gray-400 border-2 border-gray-700"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gap: '1px'
        }}
      >
        {grid.flat().map((cell, index) => {
          const row = Math.floor(index / gridSize);
          const col = index % gridSize;
          const isBlocker = cell.isBlocker;
          const isActive = activeCell?.row === row && activeCell?.col === col;
          
          let isInActiveWord = false;
          if (activeCell) {
            const { row: activeRow, col: activeCol } = activeCell;
            if (direction === 'across') {
                if (row === activeRow && !grid[row][col].isBlocker) {
                    let startCol = activeCol;
                    while (startCol > 0 && !grid[row][startCol - 1].isBlocker) startCol--;
                    let endCol = activeCol;
                    while (endCol < gridSize - 1 && !grid[row][endCol + 1].isBlocker) endCol++;
                    if (col >= startCol && col <= endCol) isInActiveWord = true;
                }
            } else { // 'down'
                if (col === activeCol && !grid[row][col].isBlocker) {
                    let startRow = activeRow;
                    while (startRow > 0 && !grid[startRow - 1][col].isBlocker) startRow--;
                    let endRow = activeRow;
                    while (endRow < gridSize - 1 && !grid[endRow + 1][col].isBlocker) endRow++;
                    if (row >= startRow && row <= endRow) isInActiveWord = true;
                }
            }
          }

          const validationState = validationGrid[row][col];
          let bgColor = 'bg-white';
          if (isActive) bgColor = 'bg-blue-300';
          else if (isInActiveWord) bgColor = 'bg-yellow-200';
          
          let textColor = 'text-black';
          if(validationState === 'correct') textColor = 'text-green-600';
  
          if(validationState === 'incorrect') textColor = 'text-red-600';

          return (
            <div
              key={index}
              className={`relative flex items-center justify-center aspect-square text-sm sm:text-base md:text-lg font-bold uppercase select-none
                ${ isBlocker ? 'bg-gray-800' : `${bgColor} ${textColor} ${isGameOver ? 'cursor-not-allowed' : 'cursor-pointer'}` }
              `}
              onClick={() => !isBlocker && !isGameOver && onCellClick(row, col)}
            >
              {cell.number && (
                <span className="absolute top-0 left-0 text-[8px] sm:text-[10px] leading-none font-normal text-gray-600 p-0.5">
                  {cell.number}
                </span>
              )}
              {playerGrid[row]?.[col]}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default PlayerGrid;
