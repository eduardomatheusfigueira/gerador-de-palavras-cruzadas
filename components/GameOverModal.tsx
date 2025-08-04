import React from 'react';

interface GameOverModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: 'win' | 'lose';
  timeLeft?: number;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ isOpen, onClose, status, timeLeft }) => {
  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  const title = status === 'win' ? 'Parabéns!' : 'Tempo Esgotado!';
  const message = status === 'win'
    ? `Você completou as palavras cruzadas com ${formatTime(timeLeft || 0)} de tempo restante!`
    : 'Você não conseguiu completar a tempo. Que tal tentar de novo?';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 transition-opacity duration-300">
      <div className="bg-white p-8 rounded-xl shadow-2xl max-w-sm w-full text-center transform scale-95 hover:scale-100 transition-transform duration-300">
        <h2 className="text-3xl font-bold mb-4">{title}</h2>
        <p className="text-lg mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
        >
          Voltar ao Editor
        </button>
      </div>
    </div>
  );
};

export default GameOverModal;
