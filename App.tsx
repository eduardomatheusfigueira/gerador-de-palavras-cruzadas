
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BRAND_NAME, BRAND_TAGLINE } from './brand';
import { Toaster, toast } from 'react-hot-toast';
import type { WordInput, GridData, GridCell, ValidationState, Clue, PlacedWord, SavedGame } from './types';
import { generateCrosswordLayout } from './services/crosswordGenerator';
import { generateWordsWithGemini } from './services/geminiService';
import { generateCrosswordPdf } from './services/pdfGenerator';
import CrosswordGrid from './components/CrosswordGrid';
import ClueList from './components/ClueList';
import PlayerGrid from './components/PlayerGrid';
import GameOverModal from './components/GameOverModal';
import SettingsModal from './components/SettingsModal';
import GameMenu from './components/GameMenu';
import MainMenu from './components/MainMenu';

// Icons
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 hover:text-red-700"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const SparklesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6.5 6.5 0 0 0-6.5 6.5c0 1.95.89 3.71 2.28 4.95A6.5 6.5 0 0 0 12 21a6.5 6.5 0 0 0 6.5-6.5c0-1.95-.89-3.71-2.28-4.95A6.5 6.5 0 0 0 12 3Z" /><path d="M5 3v4" /><path d="M19 3v4" /><path d="M22 12h-4" /><path d="M2 12H6" /><path d="m7 7-4 4" /><path d="m17 7 4 4" /><path d="m7 17 4 4" /><path d="m17 17-4 4" /></svg>);
const PdfIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>);
const PlayIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5.26 17.53 1.41 1.41C8.21 20.48 10 21 12 21s3.79-.52 5.33-1.94l1.41-1.41" /><path d="M5.26 6.47 6.67 5.06C8.21 3.52 10 3 12 3s3.79.52 5.33 1.94l1.41 1.41" /><path d="M15.53 5.26 14.12 6.67C12.48 8.21 12 10 12 12s.48 3.79 1.94 5.33l1.41 1.41" /><path d="M8.47 5.26 9.88 6.67C11.52 8.21 12 10 12 12s-.48 3.79-1.94 5.33L8.47 18.74" /><path d="M12 8v8" /><path d="M8 12h8" /></svg>);
const ShowAnswersIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const LoadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>);
const KeyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>);
const TimerIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>);

export default function App() {
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    // Editor State
    const [words, setWords] = useState<WordInput[]>([]);
    const [gridData, setGridData] = useState<GridData | null>(null);
    const [newWord, setNewWord] = useState('');
    const [newClue, setNewClue] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [theme, setTheme] = useState('Animais do Brasil');
    const [wordCount, setWordCount] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [showSolution, setShowSolution] = useState(false);
    const [apiKey, setApiKey] = useState(() => sessionStorage.getItem('gemini-api-key') || '');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    const handlePlayOnline = () => {
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
        setTimeLeft(300); // 5 minutes
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

    const handleAddWord = (e: React.FormEvent) => {
        e.preventDefault();
        if (newWord.trim() && newClue.trim()) {
            const sanitizedWord = newWord.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, '').toUpperCase();
            if(sanitizedWord.length < 2) { setError("A palavra deve conter pelo menos 2 letras."); return; }
            setWords([...words, { id: crypto.randomUUID(), word: sanitizedWord, clue: newClue.trim() }]);
            setNewWord(''); setNewClue(''); setError(null);
        } else {
            setError("Tanto a palavra quanto a dica são obrigatórias.");
        }
    };

    const handleRemoveWord = (id: string) => setWords(words.filter(word => word.id !== id));
    
    const handleGenerateGrid = useCallback(() => {
        setShowSolution(false);
        const validWords = words.filter(w => w.word.trim() && w.clue.trim());
        if (validWords.length < 2) { setGridData(null); return; }
        setError(null);
        const result = generateCrosswordLayout(validWords, 20);
        if (result && result.clues.across.length + result.clues.down.length > 0) {
            setGridData(result);
        } else {
            setError("Não foi possível gerar uma grade com as palavras fornecidas.");
            setGridData(null);
        }
    }, [words]);

    const handleGenerateWithGemini = async () => {
        if (!apiKey.trim()) {
            toast.error("Por favor, insira sua chave de API do Google Gemini.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setGridData(null);
        setShowSolution(false);
        try {
            const generatedWords = await generateWordsWithGemini(theme, wordCount, apiKey);
            setWords(generatedWords.map(item => ({ id: crypto.randomUUID(), ...item })));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
            toast.error(err instanceof Error ? err.message : "Ocorreu um erro desconhecido.");
            setWords([]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleGeneratePdf = (includeSolution: boolean) => {
        if (!gridData) {
            toast.error("Não há grade para gerar PDF. Gere uma grade primeiro.");
            return;
        }
        toast.success("Gerando seu PDF...");
        generateCrosswordPdf(gridData, theme, includeSolution);
    };
    
    const handleSaveGame = () => {
        if (!gridData || !words.length) {
            toast.error("Não há jogo para salvar. Gere uma grade primeiro.");
            return;
        }
        const savedGame: SavedGame = {
            theme,
            words,
            gridData,
        };
        const jsonString = JSON.stringify(savedGame, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const sanitizedTheme = theme.trim().toLowerCase().replace(/[^a-z0-9]/g, '_') || 'palavras_cruzadas';
        a.href = url;
        a.download = `${sanitizedTheme}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Jogo salvo com sucesso!");
    };

    const handleLoadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const text = event.target?.result;
                if (typeof text !== 'string') {
                    throw new Error("O arquivo não é um arquivo de texto válido.");
                }
                const data = JSON.parse(text) as SavedGame;

                if (!data.theme || typeof data.theme !== 'string' ||
                    !Array.isArray(data.words) ||
                    !data.gridData || typeof data.gridData !== 'object' ||
                    !Array.isArray(data.gridData.grid)) {
                    throw new Error("Arquivo JSON inválido ou corrompido. A estrutura do jogo não corresponde ao esperado.");
                }
                
                setTheme(data.theme);
                setWords(data.words);
                setGridData(data.gridData);
                setShowSolution(false);
                setIsPlaying(false);
                setError(null);
                toast.success("Jogo carregado com sucesso!");
                setPage('editor');

            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Erro ao carregar o arquivo.";
                setError(errorMessage);
                toast.error(`Falha ao carregar o jogo: ${errorMessage}`);
            } finally {
                if(e.target) e.target.value = '';
            }
        };
        reader.onerror = () => {
             const errorMessage = "Não foi possível ler o arquivo selecionado.";
             setError(errorMessage);
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
            if (gameMode === 'timed') {
                setIsTimerRunning(false);
                setIsGameOver(true);
            }
        } else {
            toast.success(`${correctCount} de ${filledCount} letras corretas!`, { duration: 2000 });
        }
    };

    const handleRevealWord = () => {
        if (!activeClue || !gridData) return;

        // Use the current navigation direction to reveal the correct word.
        // Without checking the direction, the first word with a matching number
        // could be revealed, even if it belonged to the opposite orientation.
        const wordData = gridData.placedWords.find(
            p => p.number === activeClue.number && p.direction === direction
        );
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
        if (words.length > 0) handleGenerateGrid();
        else setGridData(null);
    }, [words, handleGenerateGrid]);

    useEffect(() => {
        if (!activeCell || !gridData) { setActiveClue(null); return; }
        const { row, col } = activeCell;
        
        const relevantPlacedWord = gridData.placedWords.find(pWord => {
            if (pWord.direction !== direction) return false;
            if (direction === 'across') {
                return pWord.row === row && col >= pWord.col && col < pWord.col + pWord.word.length;
            } else { // 'down'
                return pWord.col === col && row >= pWord.row && row < pWord.row + pWord.word.length;
            }
        });

        if (relevantPlacedWord) {
            const clues = direction === 'across' ? gridData.clues.across : gridData.clues.down;
            const foundClue = clues.find(c => c.number === relevantPlacedWord.number);
            setActiveClue(foundClue || null);
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
        return () => {
            clearInterval(timer);
        };
    }, [isTimerRunning, isPlaying, gameMode]);

    useEffect(() => {
        if (isGameOver && gameMode === 'timed') {
            if (timeLeft === 0) {
                setGameStatus('lose');
            } else {
                setGameStatus('win');
            }
            setShowGameOverModal(true);
        }
    }, [isGameOver, gameMode, timeLeft]);

    const renderEditor = () => (
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <button onClick={() => setPage('menu')} className="lg:col-span-3 mb-4 text-sm text-blue-600 flex items-center gap-1">
                ← Menu
            </button>
            <div className="lg:col-span-1">
                <GameMenu
                    onGenerateWithAI={handleGenerateWithGemini}
                    onAddWordsManually={() => { /* For future use */ }}
                    onLoadGame={handleLoadClick}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                    isLoading={isLoading}
                    theme={theme}
                    onThemeChange={setTheme}
                    wordCount={wordCount}
                    onWordCountChange={setWordCount}
                />
                 {/* This section could be a separate component */}
                 <div className="mt-8 bg-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-lg font-bold border-b border-gray-200 pb-2 mb-4">Lista de Palavras ({words.length})</h3>
                    <div className="space-y-3 overflow-y-auto max-h-72 pr-2">
                        {words.length === 0 && !isLoading && <p className="text-gray-500 text-sm">Sua lista está vazia. Gere palavras com IA ou adicione manualmente.</p>}
                        {isLoading && <p className="text-gray-500 text-sm">Gerando palavras...</p>}
                        {words.map(word => (
                            <div key={word.id} className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                                <div><p className="font-bold uppercase">{word.word}</p><p className="text-sm text-gray-600">{word.clue}</p></div>
                                <button onClick={() => handleRemoveWord(word.id)} className="p-1 rounded-full hover:bg-red-100 transition"><TrashIcon /></button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                {gridData ? (
                    <>
                        <div className="flex justify-end mb-4 gap-2 flex-wrap">
                            <button onClick={() => setShowSolution(!showSolution)} className="inline-flex items-center gap-2 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-purple-700 transition-transform transform hover:scale-105">
                                <ShowAnswersIcon />
                                {showSolution ? 'Ocultar Respostas' : 'Mostrar Respostas'}
                            </button>
                            <button onClick={handlePlayOnline} className="inline-flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105">
                                <PlayIcon />
                                Jogar Online
                            </button>
                            <button onClick={handlePlayTimedMode} className="inline-flex items-center gap-2 bg-orange-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-orange-600 transition-transform transform hover:scale-105">
                                <TimerIcon />
                                Contra o Relógio
                            </button>
                            <button onClick={handleSaveGame} className="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105">
                                <SaveIcon />
                                Salvar JSON
                            </button>
                            <div className="relative inline-block">
                                <button
                                    onClick={() => document.getElementById('pdf-menu')?.classList.toggle('hidden')}
                                    className="inline-flex items-center gap-2 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-transform transform hover:scale-105"
                                >
                                    <PdfIcon />
                                    Gerar PDF
                                </button>
                                <div id="pdf-menu" className="hidden absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleGeneratePdf(false); document.getElementById('pdf-menu')?.classList.add('hidden'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                            Apenas o Jogo
                                        </a>
                                        <a href="#" onClick={(e) => { e.preventDefault(); handleGeneratePdf(true); document.getElementById('pdf-menu')?.classList.add('hidden'); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" role="menuitem">
                                            Jogo com Respostas
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <CrosswordGrid grid={gridData.grid} showSolution={showSolution} />
                        <ClueList acrossClues={gridData.clues.across} downClues={gridData.clues.down} activeClue={null}/>
                    </>
                ) : (
                     <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
                        <h2 className="text-2xl font-bold text-gray-700">Gerando sua Grade</h2>
                        <p className="text-lg text-gray-500 mt-2">Aguarde um momento...</p>
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
                     <button onClick={handleCheckGrid} className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed" disabled={isGameOver}>Verificar Grade</button>
                     <button onClick={handleRevealWord} disabled={!activeClue || isGameOver} className="w-full bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-600 transition disabled:bg-yellow-300 disabled:cursor-not-allowed">Revelar Palavra</button>
                     <button onClick={handleRevealAll} className="w-full bg-yellow-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-yellow-700 transition disabled:bg-yellow-300 disabled:cursor-not-allowed" disabled={isGameOver}>Revelar Tudo</button>
                     <button onClick={resetPlayerState} className="w-full bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed" disabled={isGameOver}>Limpar Grade</button>
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
                       if (activeCell?.row === row && activeCell?.col === col) {
                           setDirection(prev => prev === 'across' ? 'down' : 'across');
                       } else {
                           setActiveCell({row, col});
                           // Don't reset direction here, let user control it
                       }
                    }}
                    onGridChange={setPlayerGrid}
                    onDirectionChange={setDirection}
                    onSetActiveCell={setActiveCell}
                />
                 <div className="lg:hidden mt-4 p-3 bg-yellow-100 border-l-4 border-yellow-500 rounded-r-lg shadow-sm">
                    {activeClue ? (
                        <p className="text-gray-800">
                            <span className="font-bold">{activeClue.number}. {direction === 'across' ? 'H' : 'V'}: </span>
                            {activeClue.text}
                        </p>
                    ) : (
                        <p className="text-gray-600 italic">Clique em uma célula para ver a dica.</p>
                    )}
                </div>
                <ClueList 
                    acrossClues={gridData?.clues.across || []} 
                    downClues={gridData?.clues.down || []}
                    activeClue={activeClue}
                />
            </div>
        </main>
    )

    return (
        <div className="min-h-screen">
            <Toaster position="top-center" />
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/json" className="hidden" />
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
                apiKey={apiKey}
                onApiKeyChange={setApiKey}
            />
            {page === 'menu' ? (
                <MainMenu
                    onStart={() => { setWords([]); setGridData(null); setPage('editor'); }}
                    onLoadGame={handleLoadClick}
                    onOpenSettings={() => setIsSettingsOpen(true)}
                />
            ) : (
                <div className="container mx-auto p-4 md:p-8">
                    <header className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-extrabold brand-title">
                            {BRAND_NAME}
                        </h1>
                        <p className="text-lg text-gray-600 mt-2">{BRAND_TAGLINE}</p>
                    </header>

                    {page === 'player' ? renderPlayer() : renderEditor()}

                     <footer className="text-center mt-12 text-gray-500 text-sm">
                        <p>Desenvolvido com React, TypeScript, Tailwind CSS e a API Google Gemini.</p>
                    </footer>
                </div>
            )}
            <GameOverModal
                isOpen={showGameOverModal}
                onClose={handleCloseModal}
                status={gameStatus}
                timeLeft={timeLeft}
            />
        </div>
    );
}
