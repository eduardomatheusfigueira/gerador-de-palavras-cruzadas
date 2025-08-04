
import { GoogleGenAI } from "@google/genai";
import type { WordInput } from '../types';

export const generateWordsWithGemini = async (theme: string, wordCount: number, apiKey: string): Promise<Omit<WordInput, 'id'>[]> => {
  if (!apiKey || !apiKey.trim()) {
      throw new Error("A chave de API do Google Gemini não foi fornecida.");
  }
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Gere uma lista de ${wordCount} palavras e dicas em Português do Brasil (PT-BR) para um jogo de palavras cruzadas sobre o tema "${theme}".
Considere as particularidades culturais e linguísticas do Brasil, usando termos comuns no país em vez de traduções literais.
As palavras devem ter entre 3 e 12 letras.
As palavras não devem conter espaços ou caracteres especiais.
As palavras devem estar em MAIÚSCULAS.
Responda APENAS com um array de objetos JSON. Cada objeto deve ter as chaves "word" e "clue".
Não inclua markdown \`\`\`json\`\`\` ou qualquer outro texto antes ou depois do array JSON.

Exemplo de Resposta:
[
  {"word": "SATURNO", "clue": "Planeta com anéis proeminentes"},
  {"word": "JUPITER", "clue": "Maior planeta do nosso sistema solar"}
]
`;

  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            temperature: 0.8,
        },
    });

    let jsonStr = response.text.trim();
    
    const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[1]) {
      jsonStr = match[1].trim();
    }
    
    const parsedData = JSON.parse(jsonStr) as { word: string, clue: string }[];

    if (!Array.isArray(parsedData) || parsedData.some(item => !item.word || !item.clue)) {
      throw new Error("A IA retornou uma estrutura de dados de palavras inválida.");
    }

    // Sanitize data from AI
    return parsedData.map(p => ({
        word: p.word.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z\s]/gi, "").replace(/\s+/g, '').toUpperCase(),
        clue: p.clue.trim()
    })).filter(p => p.word.length > 2);

  } catch (error) {
    console.error("Erro ao gerar palavras com o Gemini:", error);
    if (error instanceof Error && (error.message.includes('API key not valid') || error.message.includes('API_KEY_INVALID'))) {
        throw new Error("A chave de API fornecida é inválida. Verifique sua chave e tente novamente.");
    }
    if (error instanceof Error && error.message.includes('JSON')) {
        throw new Error("Falha ao analisar os dados de palavras da IA. A resposta não estava no formato JSON esperado.");
    }
    throw new Error("Não foi possível gerar as palavras. Verifique sua chave de API e a conexão com a internet.");
  }
};
