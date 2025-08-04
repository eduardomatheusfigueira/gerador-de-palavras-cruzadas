import React from 'react';
import type { Clue } from '../types';

interface ClueListProps {
  acrossClues: Clue[];
  downClues: Clue[];
  activeClue: Clue | null;
}

const ClueList: React.FC<ClueListProps> = ({ acrossClues, downClues, activeClue }) => {
  if (acrossClues.length === 0 && downClues.length === 0) {
    return null;
  }

  const renderClueList = (clues: Clue[], direction: 'across' | 'down') => (
    <ul className="space-y-2 text-sm text-gray-700 mt-3">
      {clues.map((clue) => {
        const isActive = activeClue?.number === clue.number && activeClue?.word === clue.word;
        return (
          <li
            key={`${direction}-${clue.number}`}
            className={`flex p-1 rounded-md transition-colors duration-200 ${isActive ? 'bg-yellow-200' : ''}`}
          >
            <span className="font-bold w-6 text-right mr-2 flex-shrink-0">{clue.number}.</span>
            <span>{clue.text}</span>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-8">
      {acrossClues.length > 0 && (
        <div>
            <h3 className="text-xl font-bold mb-3 text-gray-800 border-b-2 border-indigo-500 pb-2">Horizontais</h3>
            {renderClueList(acrossClues, 'across')}
        </div>
      )}
      {downClues.length > 0 && (
        <div>
            <h3 className="text-xl font-bold mb-3 text-gray-800 border-b-2 border-indigo-500 pb-2">Verticais</h3>
            {renderClueList(downClues, 'down')}
        </div>
      )}
    </div>
  );
};

export default ClueList;