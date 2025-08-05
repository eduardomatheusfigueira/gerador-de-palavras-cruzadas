import React from 'react';

interface MainMenuProps {
    onStart: () => void;
    onLoadGame: () => void;
    onOpenSettings: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onLoadGame, onOpenSettings }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-6 bg-gradient-to-b from-indigo-500 to-purple-600 text-white p-4">
            <h1 className="text-5xl font-extrabold mb-8 text-center drop-shadow">Palavras Cruzadas</h1>
            <button onClick={onStart} className="w-64 bg-white text-indigo-700 font-bold py-3 rounded-lg shadow hover:bg-gray-100 transition">
                Novo Jogo
            </button>
            <button onClick={onLoadGame} className="w-64 bg-white text-indigo-700 font-bold py-3 rounded-lg shadow hover:bg-gray-100 transition">
                Carregar Jogo
            </button>
            <button onClick={onOpenSettings} className="w-64 bg-white text-indigo-700 font-bold py-3 rounded-lg shadow hover:bg-gray-100 transition">
                Configurações
            </button>
        </div>
    );
};

export default MainMenu;
