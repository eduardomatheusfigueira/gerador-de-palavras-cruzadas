import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import type { WordInput, GridData, ValidationState, Clue, SavedGame } from './types';
import { generateCrosswordLayout } from './services/crosswordGenerator';
import { generateCrosswordPdf } from './services/pdfGenerator';
import CrosswordGrid from './components/CrosswordGrid';
import ClueList from './components/ClueList';
import PlayerGrid from './components/PlayerGrid';
import GameOverModal from './components/GameOverModal';
import MainMenu from './components/MainMenu';
import Creator from './components/Creator'; // Import the new Creator component

// Icons (some may be removed if no longer used directly in App.tsx)
const PdfIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);
const ShowAnswersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);

export default function App() {
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    // State
    const [words, setWords] = useState<WordInput[]>([]);
    const [gridData, setGridData] = useState<GridData | null>(null);
    const [theme, setTheme] = useState('Novo Tema');
    const [showSolution, setShowSolution] = useState(false);
    const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('gemini-api-key') || '');
    const [timerSpeed, setTimerSpeed] = useState<'rapido' | 'medio' | 'lento'>('medio');

    // Navigation
    const [page, setPage] = useState<'menu' | 'editor' | 'player'>('menu');

    // Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameMode, setGameMode] = useState<'classic' | 'timed'>('classic');
    const [timeLeft, setTimeLeft] = useState(300);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [showGameOverModal, setShowGameOverModal] = useState(false);
    const [gameStatus, setGameStatus] = useState<'win' | 'lose'>('lose');
    const [playerGrid, setPlayerGrid] = useState<(string | null)[][]>([]);
    const [validationGrid, setValidationGrid] = useState<ValidationState[][]>([]);
    const [activeCell, setActiveCell] = useState<{row: number, col: number} | null>(null);
    const [direction, setDirection] = useState<'across' | 'down'>('across');
    const [activeClue, setActiveClue] = useState<Clue | null>(null);
    
    const playerGridRef = useRef<HTMLDivElement>(null);

     useEffect(() => {
        if (apiKey) {
            sessionStorage.setItem('gemini-api-key', apiKey);
        } else {
            sessionStorage.removeItem('gemini-api-key');
        }
    }, [apiKey]);

    const resetPlayerState = () => {
        if (!gridData) return;
        const { grid } = gridData;
        setPlayerGrid(grid.map(row => row.map(() => '')));
        setValidationGrid(grid.map(row => row.map(() => 'none')));
        setActiveCell(null);
        setActiveClue(null);
        setDirection('across');
    };

    const handlePlayClassic = () => {
        if (!gridData) return;
        setGameMode('classic');
        setIsTimerRunning(false);
        setIsGameOver(false);
        resetPlayerState();
        setIsPlaying(true);
        setPage('player');
    };

    const handlePlayTimedMode = () => {
        if (!gridData) return;
        setGameMode('timed');
        const durations: Record<'rapido' | 'medio' | 'lento', number> = { rapido: 120, medio: 300, lento: 600 };
        setTimeLeft(durations[timerSpeed]);
        setIsTimerRunning(true);
        setIsGameOver(false);
        resetPlayerState();
        setIsPlaying(true);
        setPage('player');
    };

    const handleBackToEditor = () => {
        setIsPlaying(false);
        setIsTimerRunning(false);
        setPage('editor');
    };

    const handleCloseModal = () => {
        setShowGameOverModal(false);
        handleBackToEditor();
    };
    
    const handleGenerateGridAndPlay = useCallback((generatedWords: WordInput[], generatedTheme: string) => {
        setShowSolution(false);
        setWords(generatedWords);
        setTheme(generatedTheme);

        if (generatedWords.length < 2) {
            toast.error("São necessárias pelo menos 2 palavras para gerar uma grade.");
            setGridData(null);
            return;
        }

        const result = generateCrosswordLayout(generatedWords, 20);
        if (result && result.clues.across.length + result.clues.down.length > 0) {
            setGridData(result);
            toast.success("Grade gerada! Escolha um modo de jogo.");
        } else {
            toast.error("Não foi possível gerar uma grade com as palavras fornecidas.");
            setGridData(null);
        }
    }, []);
    
    const handleGeneratePdf = (includeSolution: boolean) => {
        if (!gridData) {
            toast.error("Não há grade para gerar PDF. Gere uma grade primeiro.");
            return;
        }
        toast.success("Gerando seu PDF...");
        generateCrosswordPdf(gridData, theme, includeSolution);
    };
    
    const handleSaveGame = (themeToSave: string, wordsToSave: WordInput[]) => {
        if (wordsToSave.length === 0) {
            toast.error("Não há nada para salvar.");
            return;
        }
        // Use the current grid if available, otherwise save without it
        const savedGame: SavedGame = {
            theme: themeToSave,
            words: wordsToSave,
            gridData: gridData, // This can be null
        };
        const jsonString = JSON.stringify(savedGame, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const sanitizedTheme = themeToSave.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'palavras_cruzadas';
        a.href = url;
        a.download = `${sanitizedTheme}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Jogo salvo com sucesso!");
    };

    const handleLoadGame = (file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text !== 'string') throw new Error("O arquivo não é um arquivo de texto válido.");

                const data = JSON.parse(text) as SavedGame;

                if (!data.theme || typeof data.theme !== 'string' || !Array.isArray(data.words)) {
                    throw new Error("Arquivo JSON inválido. A estrutura do jogo não corresponde ao esperado.");
                }
                
                setTheme(data.theme);
                setWords(data.words);
                // Load grid data if it exists, otherwise set to null
                setGridData(data.gridData || null);

                setShowSolution(false);
                setIsPlaying(false);
                toast.success("Jogo carregado com sucesso!");
                setPage('editor');

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao carregar o arquivo.";
                toast.error(`Falha ao carregar o jogo: ${errorMessage}`);
            }
        };
        reader.onerror = () => {
             const errorMessage = "Não foi possível ler o arquivo selecionado.";
             toast.error(errorMessage);
        };
        reader.readAsText(file);
    };

    // Player Actions
    const handleCheckGrid = () => {
        if (!gridData) return;
        let correctCount = 0;
        let filledCount = 0;
        let totalFillableCells = 0;

        const newValidationGrid = playerGrid.map((row, r) => row.map((cell, c) => {
            const gridCell = gridData.grid[r][c];
            if (gridCell.isBlocker) return 'none';
            totalFillableCells++;
            if (!cell || cell === '') return 'none';
            filledCount++;
            const isCorrect = gridCell.char === cell.toUpperCase();
            if (isCorrect) correctCount++;
            return isCorrect ? 'correct' : 'incorrect';
        }));
        setValidationGrid(newValidationGrid);
        if (correctCount === totalFillableCells && filledCount === totalFillableCells) {
            toast.success(`Parabéns! Você completou o quebra-cabeça!`);
            if (gameMode === 'timed') setIsTimerRunning(false);
            setIsGameOver(true);
        } else {
            toast.success(`${correctCount} de ${filledCount} letras corretas!`, { duration: 2000 });
        }
    };

    const handleRevealWord = () => {
        if (!activeClue || !gridData) return;
        const wordData = gridData.placedWords.find(p => p.number === activeClue.number && p.direction === direction);
        if (!wordData) return;
        const newPlayerGrid = playerGrid.map(row => [...row]);
        for (let i = 0; i < wordData.word.length; i++) {
            const r = wordData.direction === 'down' ? wordData.row + i : wordData.row;
            const c = wordData.direction === 'across' ? wordData.col + i : wordData.col;
            newPlayerGrid[r][c] = wordData.word[i];
        }
        setPlayerGrid(newPlayerGrid);
    };

    const handleRevealAll = () => {
        if (!gridData) return;
        setPlayerGrid(gridData.grid.map(row => row.map(cell => cell.char)));
    };
    
    useEffect(() => {
        if (!activeCell || !gridData) { setActiveClue(null); return; }
        const { row, col } = activeCell;
        const relevantPlacedWord = gridData.placedWords.find(pWord => {
            if (pWord.direction !== direction) return false;
            if (direction === 'across') return pWord.row === row && col >= pWord.col && col < pWord.col + pWord.word.length;
            else return pWord.col === col && row >= pWord.row && row < pWord.row + pWord.word.length;
        });
        if (relevantPlacedWord) {
            const clues = direction === 'across' ? gridData.clues.across : gridData.clues.down;
            setActiveClue(clues.find(c => c.number === relevantPlacedWord.number) || null);
        } else {
             setActiveClue(null);
        }
    }, [activeCell, direction, gridData]);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (gameMode === 'timed' && isTimerRunning && isPlaying) {
            timer = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timer);
                        setIsTimerRunning(false);
                        setIsGameOver(true);
                        toast.error("O tempo acabou!", { duration: 5000 });
                        return 0;
                    }
                    return prevTime - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isTimerRunning, isPlaying, gameMode]);

    useEffect(() => {
        if (isGameOver && gameMode === 'timed') {
            setGameStatus(timeLeft === 0 ? 'lose' : 'win');
            setShowGameOverModal(true);
        }
    }, [isGameOver, gameMode, timeLeft]);

    const renderEditor = () => (
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <button onClick={() => setPage('menu')} className="lg:col-span-2 mb-2 text-sm text-blue-600 flex items-center gap-1">
                ← Voltar ao Menu
            </button>

            {/* Left Column: Creator Component */}
            <Creator
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
                initialTheme={theme}
                initialWords={words}
                onGenerateGrid={handleGenerateGridAndPlay}
                onSaveGame={handleSaveGame}
                onLoadGame={handleLoadGame}
            />

            {/* Right Column: Preview and Actions */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-center mb-4">Pré-visualização e Jogo</h2>
                {gridData ? (
                    <>
                        <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold">{theme}</h3>
                             <button onClick={() => setShowSolution(!showSolution)} className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 font-bold py-2 px-3 rounded-lg hover:bg-purple-200 transition text-sm">
                                <ShowAnswersIcon />
                                {showSolution ? 'Ocultar' : 'Mostrar'}
                            </button>
                        </div>
                        <CrosswordGrid grid={gridData.grid} showSolution={showSolution} />

                        <div className="mt-6 border-t pt-4">
                            <h3 className="text-lg font-bold text-center mb-4">Pronto para Jogar?</h3>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={handlePlayClassic} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition">Modo Clássico</button>
                                <button onClick={handlePlayTimedMode} className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition">Modo Cronometrado</button>
                            </div>
                            <div className="relative text-center mt-4">
                                <button onClick={() => document.getElementById('pdf-menu')?.classList.toggle('hidden')} className="inline-flex items-center gap-2 text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-50 transition">
                                    <PdfIcon /> Gerar PDF
                                </button>
                                <div id="pdf-menu" className="hidden absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                    <div className="py-1">
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleGeneratePdf(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Apenas o Jogo</a>
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleGeneratePdf(true); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Jogo com Respostas</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                     <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center bg-gray-50 rounded-lg">
                        <h2 className="text-xl font-bold text-gray-700">Gere uma grade</h2>
                        <p className="text-gray-500 mt-2">Use as opções à esquerda para criar ou carregar palavras e, em seguida, clique em "Gerar Cruzadinha".</p>
                    </div>
                )}
            </div>
        </main>
    );

    const renderPlayer = () => (
        <main className="flex flex-col lg:grid lg:grid-cols-3 gap-8">
            <button onClick={() => setPage('menu')} className="mb-4 text-sm text-blue-600 lg:col-span-3 flex items-center gap-1">
                ← Menu
            </button>
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-lg flex flex-col h-fit lg:order-2">
                <h2 className="text-2xl font-bold mb-1">Modo de Jogo</h2>
                <p className="text-gray-600 mb-4 text-sm">Tema: {theme}</p>
                {gameMode === 'timed' && (
                    <div className="text-center my-4 p-4 bg-gray-100 rounded-lg">
                        <p className="text-lg font-medium text-gray-700">Tempo Restante</p>
                        <p className={`text-5xl font-bold ${timeLeft < 60 && timeLeft > 0 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                            {formatTime(timeLeft)}
                        </p>
                    </div>
                )}
                <div className="space-y-3">
                     <button onClick={handleCheckGrid} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300" disabled={isGameOver}>Verificar Grade</button>
                     <button onClick={handleRevealWord} disabled={!activeClue || isGameOver} className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition disabled:bg-yellow-300">Revelar Palavra</button>
                     <button onClick={handleRevealAll} className="w-full bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-700 transition disabled:bg-yellow-300" disabled={isGameOver}>Revelar Tudo</button>
                     <button onClick={resetPlayerState} className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition" disabled={isGameOver}>Limpar Grade</button>
                     <button onClick={handleBackToEditor} className="w-full mt-6 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition">Voltar ao Editor</button>
                </div>
            </div>
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg lg:order-1">
                <PlayerGrid
                    ref={playerGridRef}
                    grid={gridData!.grid}
                    playerGrid={playerGrid}
                    validationGrid={validationGrid}
                    isGameOver={isGameOver}
                    activeCell={activeCell}
                    direction={direction}
                    onCellClick={(row, col) => {
                       if (activeCell?.row === row && activeCell?.col === col) setDirection(prev => prev === 'across' ? 'down' : 'across');
                       else setActiveCell({row, col});
                    }}
                    onGridChange={setPlayerGrid}
                    onDirectionChange={setDirection}
                    onSetActiveCell={setActiveCell}
                />
                 <div className="lg:hidden mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded-r-lg shadow-sm">
                    {activeClue ? (
                        <p className="text-gray-800"><span className="font-bold">{activeClue.number}. {direction === 'across' ? 'H' : 'V'}: </span>{activeClue.text}</p>
                    ) : (
                        <p className="text-gray-600 italic">Clique em uma célula para ver a dica.</p>
                    )}
                </div>
                <ClueList acrossClues={gridData?.clues.across || []} downClues={gridData?.clues.down || []} activeClue={activeClue} />
            </div>
        </main>
    )

    return (
        <div className="min-h-screen">
            <Toaster position="top-center" />
            {/* The file input is now managed by Creator.tsx */}

            {page === 'menu' ? (
                <MainMenu
                    onStart={() => { setWords([]); setGridData(null); setTheme('Novo Tema'); setPage('editor'); }}
                    onLoadGame={() => {
                        // This is now handled by Creator, but we need to switch to the editor page first
                        setPage('editor');
                        // We can't directly trigger the file input, so we might need a different approach
                        // For now, loading from the main menu is disabled in favor of loading from the editor
                        toast.error("Para carregar um jogo, inicie um novo jogo e use a opção 'Carregar' no editor.");
                     }}
                    onOpenSettings={() => toast.success("As configurações de API agora estão no editor.")}
                />
            ) : (
                <div className="container mx-auto p-4 md:p-8">
                    {page === 'player' ? renderPlayer() : renderEditor()}

                    <footer className="text-center mt-12 text-gray-500 text-sm">
                        <p>Desenvolvido com React, TypeScript, Tailwind CSS e a API Google Gemini.</p>
                    </footer>
                </div>
            )}
            <GameOverModal isOpen={showGameOverModal} onClose={handleCloseModal} status={gameStatus} timeLeft={timeLeft} />
        </div>
    );
}
