import React from 'react';
import { BRAND_NAME } from '../brand';

interface MainMenuProps {
    onStart: () => void;
    onLoadGame: () => void;
    onOpenSettings: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStart, onLoadGame, onOpenSettings }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-6 brand-bg text-white p-4">
            <h1 className="text-5xl font-extrabold mb-8 text-center drop-shadow brand-title">{BRAND_NAME}</h1>
            <button onClick={onStart} className="w-64 brand-button font-bold py-3 rounded-lg shadow">
                Novo Jogo
            </button>
            <button onClick={onLoadGame} className="w-64 brand-button font-bold py-3 rounded-lg shadow">
                Carregar Jogo
            </button>
            <button onClick={onOpenSettings} className="w-64 brand-button font-bold py-3 rounded-lg shadow">
                Configurações
            </button>
        </div>
    );
};

export default MainMenu;
