import React from 'react';

// Icons
const SparklesIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6.5 6.5 0 0 0-6.5 6.5c0 1.95.89 3.71 2.28 4.95A6.5 6.5 0 0 0 12 21a6.5 6.5 0 0 0 6.5-6.5c0-1.95-.89-3.71-2.28-4.95A6.5 6.5 0 0 0 12 3Z" /><path d="M5 3v4" /><path d="M19 3v4" /><path d="M22 12h-4" /><path d="M2 12H6" /><path d="m7 7-4 4" /><path d="m17 7 4 4" /><path d="m7 17 4 4" /><path d="m17 17-4 4" /></svg>);
const PlusIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-white"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>);
const LoadIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>);
const SettingsIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>);


interface GameMenuProps {
    onGenerateWithAI: () => void;
    onAddWordsManually: () => void;
    onLoadGame: () => void;
    onOpenSettings: () => void;
    isLoading: boolean;
    theme: string;
    onThemeChange: (theme: string) => void;
    wordCount: number;
    onWordCountChange: (count: number) => void;
}

const GameMenu: React.FC<GameMenuProps> = ({
    onGenerateWithAI,
    onAddWordsManually,
    onLoadGame,
    onOpenSettings,
    isLoading,
    theme,
    onThemeChange,
    wordCount,
    onWordCountChange
}) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-fit relative">
            <div className="absolute top-4 right-4">
                <button onClick={onOpenSettings} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
                    <SettingsIcon />
                </button>
            </div>

            <h2 className="text-2xl font-bold mb-6 text-center">Criar Palavras Cruzadas</h2>

            <div className="space-y-4 flex flex-col items-center">
                {/* AI Section */}
                <div className="w-full max-w-xs space-y-3">
                    <h3 className="text-lg font-semibold text-center text-gray-700">Gerar com IA</h3>
                    <div>
                        <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
                        <input id="theme" type="text" value={theme} onChange={(e) => onThemeChange(e.target.value)} placeholder="Ex: Capitais do Mundo" className="w-full bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" disabled={isLoading}/>
                    </div>
                    <div>
                        <label htmlFor="wordCount" className="block text-sm font-medium text-gray-700 mb-1">Nº de Palavras</label>
                        <input id="wordCount" type="number" value={wordCount} onChange={(e) => onWordCountChange(Math.max(5, Math.min(40, Number(e.target.value))))} className="w-full bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500" min="5" max="40" disabled={isLoading}/>
                    </div>
                    <button
                        onClick={onGenerateWithAI}
                        disabled={isLoading}
                        className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 flex items-center justify-center gap-2 disabled:bg-indigo-300 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon />
                        {isLoading ? 'Gerando...' : 'Gerar Palavras'}
                    </button>
                </div>

                <div className="w-full max-w-xs text-center">
                    <p className="text-gray-500 my-2">ou</p>
                </div>

                {/* Manual & Load Section */}
                <div className="w-full max-w-xs space-y-3">
                     <button
                        onClick={onAddWordsManually}
                        className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <PlusIcon />
                        Adicionar Palavras
                    </button>
                    <button
                        onClick={onLoadGame}
                        className="w-full bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 transition-transform transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                        <LoadIcon />
                        Carregar Jogo (.json)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GameMenu;
