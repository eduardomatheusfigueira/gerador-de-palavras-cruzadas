import React from 'react';

// Icons
const KeyIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>);
const CloseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);


interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onApiKeyChange: (key: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, onApiKeyChange }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full m-4">
        <div className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-3"><KeyIcon /> Configurações</h2>
            <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200">
                <CloseIcon />
            </button>
        </div>

        <div className="space-y-4">
            <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
                    Chave de API do Google Gemini
                </label>
                <input
                    id="apiKey"
                    type="password"
                    value={apiKey}
                    onChange={(e) => onApiKeyChange(e.target.value)}
                    placeholder="Cole sua chave de API aqui"
                    className="w-full bg-white text-gray-900 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
            </div>
            <p className="text-xs text-gray-500">
                Sua chave é salva apenas neste navegador.
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline ml-1">
                    Obtenha uma chave de API aqui.
                </a>
            </p>
        </div>

        <div className="mt-6 border-t border-gray-200 pt-4 flex justify-end">
            <button
                onClick={onClose}
                className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105"
            >
                Fechar
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
