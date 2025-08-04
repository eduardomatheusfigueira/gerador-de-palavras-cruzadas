// Representa uma palavra e sua dica inserida pelo usuário.
export interface WordInput {
  id: string;
  word: string;
  clue: string;
}

// Representa uma célula individual na grade de palavras cruzadas.
export interface GridCell {
  char: string | null;      // A letra na célula, ou null se vazia.
  isBlocker: boolean;       // True se for um quadrado preto.
  number: number | null;    // O número da dica que começa aqui.
}

// Representa uma palavra que foi colocada com sucesso na grade.
export interface PlacedWord extends WordInput {
  row: number;
  col: number;
  direction: 'across' | 'down'; // Direção da palavra.
  number: number;
}

// Representa uma dica formatada para exibição.
export interface Clue {
  number: number;
  text: string;
  word: string;
}

// Dados retornados pela grade e pelas dicas
export interface GridData {
    grid: GridCell[][];
    clues: {
        across: Clue[];
        down: Clue[];
    };
    placedWords: PlacedWord[];
}

// Representa o estado de validação de uma célula no modo de jogo.
export type ValidationState = 'correct' | 'incorrect' | 'none';

// Representa a estrutura de dados para salvar/carregar um jogo.
export interface SavedGame {
  theme: string;
  words: WordInput[];
  gridData: GridData;
}
