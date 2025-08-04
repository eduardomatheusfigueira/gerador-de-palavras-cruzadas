
import React from 'react';
import type { GridCell } from '../types';

interface CrosswordGridProps {
  grid: GridCell[][];
  showSolution: boolean;
}

const CrosswordGrid: React.FC<CrosswordGridProps> = ({ grid, showSolution }) => {
  if (!grid || grid.length === 0) {
    return (
      <div className="flex items-center justify-center bg-gray-100 rounded-lg shadow-inner aspect-square w-full">
        <div className="text-center p-8">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                 </svg>
            </div>
          <h3 className="text-xl font-semibold text-gray-700">Sua grade aparecerá aqui</h3>
          <p className="mt-2 text-gray-500">Gere ou adicione palavras e a grade será montada automaticamente.</p>
        </div>
      </div>
    );
  }

  const gridSize = grid.length;

  return (
    <div className="bg-white p-2 sm:p-4 rounded-lg shadow-lg aspect-square w-full max-w-[700px] mx-auto">
      <div
        className="grid bg-gray-400 border-2 border-gray-700"
        style={{
          gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))`,
          gap: '1px'
        }}
      >
        {grid.flat().map((cell, index) => {
          const isBlocker = cell.isBlocker;
          return (
            <div
              key={index}
              className={`relative flex items-center justify-center aspect-square text-xs sm:text-sm md:text-base font-bold uppercase select-none ${
                isBlocker ? 'bg-gray-800' : 'bg-white text-black'
              }`}
            >
              {!isBlocker && showSolution && cell.char}
              {cell.number && (
                <span className="absolute top-0 left-0 text-[8px] sm:text-[10px] leading-none font-normal text-gray-600 p-0.5">
                  {cell.number}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CrosswordGrid;
