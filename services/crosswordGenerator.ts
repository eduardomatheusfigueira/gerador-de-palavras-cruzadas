import type { WordInput, GridCell, PlacedWord, Clue, GridData } from '../types';

const canPlaceWord = (word: string, row: number, col: number, direction: 'across' | 'down', grid: GridCell[][]): boolean => {
    const len = word.length;
    const gridSize = grid.length;

    if (row < 0 || col < 0 || (direction === 'across' && col + len > gridSize) || (direction === 'down' && row + len > gridSize)) {
        return false;
    }

    for (let i = 0; i < len; i++) {
        const r = direction === 'down' ? row + i : row;
        const c = direction === 'across' ? col + i : col;
        
        if (r >= gridSize || c >= gridSize) return false;
        
        const cell = grid[r][c];
        const currentWordChar = word[i];
        
        // If cell is occupied, it must match the letter of the new word
        if (cell.char !== null && cell.char !== currentWordChar) return false;
        
        // If cell is empty, check for adjacent conflicts
        if (cell.char === null) {
            if (direction === 'across') {
                 if ((r > 0 && grid[r - 1][c].char !== null) || (r < gridSize - 1 && grid[r + 1][c].char !== null)) return false;
            } else { // 'down'
                 if ((c > 0 && grid[r][c - 1].char !== null) || (c < gridSize - 1 && grid[r][c + 1].char !== null)) return false;
            }
        }
    }
    
    // Check word boundaries to ensure it's not adjacent to another word in the same direction
    if (direction === 'across') {
        if ((col > 0 && grid[row][col - 1].char !== null) || (col + len < gridSize && grid[row][col + len]?.char !== null)) return false;
    } else { // 'down'
        if ((row > 0 && grid[row - 1][col].char !== null) || (row + len < gridSize && grid[row + len]?.[col]?.char !== null)) return false;
    }

    return true;
};

const calculateFit = (word: string, row: number, col: number, direction: 'across' | 'down', grid: GridCell[][]): number => {
    let score = 0;
    for (let i = 0; i < word.length; i++) {
        const r = direction === 'down' ? row + i : row;
        const c = direction === 'across' ? col + i : col;
        if (grid[r]?.[c]?.char === word[i]) {
            score++;
        }
    }
    return score;
};

const placeWord = (word: WordInput, row: number, col: number, direction: 'across' | 'down', grid: GridCell[][], placedWords: Omit<PlacedWord, 'number'>[]): void => {
    for (let i = 0; i < word.word.length; i++) {
        const r = direction === 'down' ? row + i : row;
        const c = direction === 'across' ? col + i : col;
        grid[r][c].char = word.word[i];
    }
    placedWords.push({ ...word, row, col, direction });
};

const finalizeGrid = (grid: GridCell[][]): void => {
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c].char === null) grid[r][c].isBlocker = true;
        }
    }
};

const assignNumbersAndGenerateClues = (grid: GridCell[][], tempPlacedWords: Omit<PlacedWord, 'number'>[]): { clues: { across: Clue[], down: Clue[] }, finalPlacedWords: PlacedWord[] } => {
    let clueCounter = 1;
    const numberMap = new Map<string, number>();

    // First, clear any existing numbers from the grid
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            grid[r][c].number = null;
        }
    }
    
    // Sort placed words by position to ensure consistent numbering
    const sortedPlacedWords = [...tempPlacedWords].sort((a, b) => {
        if (a.row !== b.row) return a.row - b.row;
        return a.col - b.col;
    });

    for (const pWord of sortedPlacedWords) {
        const { row, col } = pWord;

        const isAcrossStart = pWord.direction === 'across' && (col === 0 || grid[row][col - 1].isBlocker);
        const isDownStart = pWord.direction === 'down' && (row === 0 || grid[row - 1][col].isBlocker);

        if (isAcrossStart || isDownStart) {
            const key = `${row},${col}`;
            if (!numberMap.has(key)) {
                numberMap.set(key, clueCounter);
                grid[row][col].number = clueCounter;
                clueCounter++;
            }
        }
    }

    const finalPlacedWords: PlacedWord[] = tempPlacedWords.map(p => {
        const key = `${p.row},${p.col}`;
        // A word's number is the number at its starting cell.
        const wordNumber = grid[p.row][p.col].number;
        return {
            ...p,
            number: wordNumber as number,
        };
    }).filter(p => p.number != null);

    const across: Clue[] = [];
    const down: Clue[] = [];

    // Create a map to ensure we only add one clue per number per direction
    const acrossCluesMap = new Map<number, Clue>();
    const downCluesMap = new Map<number, Clue>();

    finalPlacedWords.forEach(pWord => {
        const clue: Clue = { number: pWord.number, text: pWord.clue, word: pWord.word };
        if (pWord.direction === 'across') {
            if (!acrossCluesMap.has(pWord.number)) {
                acrossCluesMap.set(pWord.number, clue);
            }
        } else {
            if (!downCluesMap.has(pWord.number)) {
                downCluesMap.set(pWord.number, clue);
            }
        }
    });
    
    const uniqueAcross = Array.from(acrossCluesMap.values()).sort((a,b) => a.number - b.number);
    const uniqueDown = Array.from(downCluesMap.values()).sort((a,b) => a.number - b.number);

    console.log('finalPlacedWords:', finalPlacedWords);
    console.log('across clues:', uniqueAcross);
    console.log('down clues:', uniqueDown);

    return { clues: { across: uniqueAcross, down: uniqueDown }, finalPlacedWords };
};

export const generateCrosswordLayout = (words: WordInput[], gridSize: number = 20): GridData | null => {
    if (words.length === 0) return null;

    const grid: GridCell[][] = Array(gridSize).fill(null).map(() =>
        Array(gridSize).fill(null).map(() => ({ char: null, isBlocker: false, number: null }))
    );
    const tempPlacedWords: Omit<PlacedWord, 'number'>[] = [];
    const sortedWords = [...words].sort((a, b) => b.word.length - a.word.length);
    
    for (const wordInput of sortedWords) {
        let bestPosition: { row: number, col: number, direction: 'across' | 'down', score: number } | null = null;
        
        if (tempPlacedWords.length === 0) {
             const row = Math.floor(gridSize / 2);
             const col = Math.floor((gridSize - wordInput.word.length) / 2);
             if (canPlaceWord(wordInput.word, row, col, 'across', grid)) {
                bestPosition = { row, col, direction: 'across', score: 0 };
             }
        } else {
            for (let i = 0; i < wordInput.word.length; i++) {
                const charToMatch = wordInput.word[i];
                for (const pWord of tempPlacedWords) {
                    for (let j = 0; j < pWord.word.length; j++) {
                        if (pWord.word[j] === charToMatch) {
                            const direction = pWord.direction === 'across' ? 'down' : 'across';
                            let row: number, col: number;
                            
                            if (direction === 'across') { // New word is horizontal
                                row = pWord.row + j;
                                col = pWord.col - i;
                            } else { // New word is vertical
                                row = pWord.row - i;
                                col = pWord.col + j;
                            }
                            
                            if (canPlaceWord(wordInput.word, row, col, direction, grid)) {
                                const score = calculateFit(wordInput.word, row, col, direction, grid);
                                if (!bestPosition || score > bestPosition.score) {
                                    bestPosition = { row, col, direction, score };
                                }
                            }
                        }
                    }
                }
            }
        }

        if (bestPosition) {
            placeWord(wordInput, bestPosition.row, bestPosition.col, bestPosition.direction, grid, tempPlacedWords);
        }
    }
    
    if (tempPlacedWords.length < words.length * 0.7) { // Heuristic: if less than 70% of words are placed, fail.
        console.warn("Could not place a sufficient number of words.");
       // return null;
    }
    if(tempPlacedWords.length === 0) return null;

    finalizeGrid(grid);
    const { clues, finalPlacedWords } = assignNumbersAndGenerateClues(grid, tempPlacedWords);

    return { grid, clues, placedWords: finalPlacedWords };
};