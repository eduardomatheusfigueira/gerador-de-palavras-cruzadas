import React, { useState, useEffect, useRef } from 'react';
import type { WordInput } from '../types';
import { generateWordsWithGemini } from '../services/geminiService';
import { toast } from 'react-hot-toast';

// Icons
const SparklesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6.5 6.5 0 0 0-6.5 6.5c0 1.95.89 3.71 2.28 4.95A6.5 6.5 0 0 0 12 21a6.5 6.5 0 0 0 6.5-6.5c0-1.95-.89-3.71-2.28-4.95A6.5 6.5 0 0 0 12 3Z" /><path d="M5 3v4" /><path d="M19 3v4" /><path d="M22 12h-4" /><path d="M2 12H6" /><path d="m7 7-4 4" /><path d="m17 7 4 4" /><path d="m7 17 4 4" /><path d="m17 17-4 4" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12"x2="19" y2="12"></line></svg>);
const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 hover:text-red-700"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>);
const SaveIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>);
const LoadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>);

interface CreatorProps {
    apiKey: string;
    onApiKeyChange: (key: string) => void;

    initialTheme: string;
    initialWords: WordInput[];

    onGenerateGrid: (words: WordInput[], theme: string) => void;
    onSaveGame: (theme: string, words: WordInput[]) => void;
    onLoadGame: (file: File) => void;
}

const Creator: React.FC<CreatorProps> = ({
    apiKey,
    onApiKeyChange,
    initialTheme,
    initialWords,
    onGenerateGrid,
    onSaveGame,
    onLoadGame,
}) => {
    // Component's internal state
    const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');
    const [theme, setTheme] = useState(initialTheme);
    const [wordCount, setWordCount] = useState(10);
    const [words, setWords] = useState<WordInput[]>(initialWords);

    const [manualWord, setManualWord] = useState('');
    const [manualClue, setManualClue] = useState('');
    const [formError, setFormError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Sync with props, e.g., after a game is loaded in App.tsx
    useEffect(() => {
        setTheme(initialTheme);
    }, [initialTheme]);

    useEffect(() => {
        setWords(initialWords);
    }, [initialWords]);


    const handleAddWord = (e: React.FormEvent) => {
        e.preventDefault();
        if (manualWord.trim() && manualClue.trim()) {
            const sanitizedWord = manualWord.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, '').toUpperCase();
            if (sanitizedWord.length < 2) {
                setFormError("A palavra deve conter pelo menos 2 letras.");
                return;
            }
            setWords(prevWords => [...prevWords, { id: crypto.randomUUID(), word: sanitizedWord, clue: manualClue.trim() }]);
            setManualWord('');
            setManualClue('');
            setFormError(null);
        } else {
            setFormError("Tanto a palavra quanto a dica são obrigatórias.");
        }
    };

    const handleRemoveWord = (id: string) => {
        setWords(words.filter(word => word.id !== id));
    };

    const handleGenerateWithGemini = async () => {
        if (!apiKey.trim()) {
            toast.error("Por favor, insira sua chave de API do Google Gemini.");
            return;
        }
        setIsLoading(true);
        setFormError(null);
        try {
            const generatedWords = await generateWordsWithGemini(theme, wordCount, apiKey);
            setWords(generatedWords.map(item => ({ id: crypto.randomUUID(), ...item })));
            toast.success("Palavras geradas com sucesso!");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Ocorreu um erro desconhecido.";
            toast.error(message);
            setFormError(message);
            setWords([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            onLoadGame(file);
        }
        // Reset file input to allow loading the same file again
        if(e.target) e.target.value = '';
    };

    // Render logic for the tabs
    const renderAiTab = () => (
        <div className="space-y-4">
            <div>
                <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                <input id="theme" type="text" value={theme} onChange={(e) => setTheme(e.target.value)} placeholder="Ex: Capitais do Mundo" className="w-full bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" disabled={isLoading} />
            </div>
            <div>
                <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 mb-1">Nº de Palavras</label>
                <input id="wordCount" type="number" value={wordCount} onChange={(e) => setWordCount(Math.max(5, Math.min(40, Number(e.target.value))))} className="w-full bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" min="5" max="40" disabled={isLoading} />
            </div>
            <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">Chave de API do Google Gemini</label>
                <input id="apiKey" type="password" value={apiKey} onChange={(e) => onApiKeyChange(e.target.value)} placeholder="Cole sua chave de API aqui" className="w-full bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" disabled={isLoading} />
                 <p className="text-xs text-gray-500 mt-1">
                    Sua chave é salva apenas neste navegador.
                    <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline ml-1">
                        Obtenha uma chave de API aqui.
                    </a>
                </p>
            </div>
            <button onClick={handleGenerateWithGemini} disabled={isLoading} className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-indigo-300 disabled:cursor-not-allowed">
                <SparklesIcon />
                {isLoading ? 'Gerando...' : 'Gerar Palavras com IA'}
            </button>
        </div>
    );

    const renderManualTab = () => (
        <form onSubmit={handleAddWord} className="space-y-4">
            <div>
                <label htmlFor="manualWord" className="block text-sm font-medium text-gray-700 mb-1">Palavra</label>
                <input id="manualWord" type="text" value={manualWord} onChange={(e) => setManualWord(e.target.value)} placeholder="Ex: BRASIL" className="w-full bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
                <label htmlFor="manualClue" className="block text-sm font-medium text-gray-700 mb-1">Dica</label>
                <input id="manualClue" type="text" value={manualClue} onChange={(e) => setManualClue(e.target.value)} placeholder="Ex: País da América do Sul" className="w-full bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" />
            </div>
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 flex items-center justify-center gap-2">
                <PlusIcon />
                Adicionar Palavra
            </button>
        </form>
    );

    return (
        <>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/json" className="hidden" />
            <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col space-y-6 h-fit">
                <h2 className="text-2xl font-bold text-center">Configuração da Cruzadinha</h2>

                <div className="flex border-b">
                    <button onClick={() => setActiveTab('ai')} className={`flex-1 py-2 font-semibold ${activeTab === 'ai' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>
                        Gerar com IA
                    </button>
                    <button onClick={() => setActiveTab('manual')} className={`flex-1 py-2 font-semibold ${activeTab === 'manual' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500'}`}>
                        Adicionar Manualmente
                    </button>
                </div>

                <div>
                    {activeTab === 'ai' ? renderAiTab() : renderManualTab()}
                </div>

                <div className="border-t border-gray-200 pt-4 flex-grow flex flex-col">
                    <h3 className="text-lg font-bold mb-4">Lista de Palavras ({words.length})</h3>
                    <div className="space-y-3 overflow-y-auto max-h-80 pr-2 flex-grow">
                        {words.length === 0 && !isLoading && <p className="text-gray-500 text-sm text-center mt-4">Sua lista está vazia.</p>}
                        {isLoading && <p className="text-gray-500 text-sm text-center mt-4">Gerando palavras...</p>}
                        {words.map(word => (
                            <div key={word.id} className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                                <div>
                                    <p className="font-bold uppercase">{word.word}</p>
                                    <p className="text-sm text-gray-600">{word.clue}</p>
                                </div>
                                <button onClick={() => handleRemoveWord(word.id)} className="p-1 rounded-full hover:bg-red-100 transition">
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                 <div className="border-t border-gray-200 pt-4 space-y-3">
                     <button onClick={() => onGenerateGrid(words, theme)} disabled={words.length < 2 || isLoading} className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 disabled:bg-green-300">
                        Gerar Cruzadinha
                    </button>
                    <div className="flex gap-3">
                        <button onClick={() => onSaveGame(theme, words)} disabled={words.length === 0} className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600 transition disabled:bg-blue-300 flex items-center justify-center gap-2">
                            <SaveIcon /> Salvar
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="w-full bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition flex items-center justify-center gap-2">
                            <LoadIcon /> Carregar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Creator;
