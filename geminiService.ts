
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

/**
 * Função auxiliar para executar chamadas à API Gemini com lógica de re-tentativa (retry)
 */
async function executeWithRetry(model: string, prompt: string, systemInstruction?: string, maxRetries = 3): Promise<string> {
  let lastError: any = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Fix: Create a new GoogleGenAI instance right before making an API call for consistency
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: model,
        contents: prompt,
        config: {
          systemInstruction: systemInstruction || "Você é um consultor estratégico de elite da Monte Imobiliária, uma empresa moçambicana líder em imobiliária, manutenção técnica e gestão hoteleira.",
          temperature: 0.8,
          topP: 0.95,
        }
      });

      // Fix: Use response.text property directly instead of method or complex chaining
      return response.text || "Sem resposta.";
    } catch (error: any) {
      lastError = error;
      const errorMsg = error?.message || String(error);
      if ((errorMsg.includes("500") || errorMsg.includes("fetch")) && i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
        continue;
      }
      break;
    }
  }
  return "Erro ao conectar com a IA.";
}

// Fix: Using gemini-3-flash-preview for basic text tasks like summarization
export const getStrategicInsight = async (context: string) => {
  const prompt = `Analise estes dados da Monte Imobiliária e forneça uma diretriz executiva curta (máx 2 frases): ${context}.`;
  return await executeWithRetry('gemini-3-flash-preview', prompt);
};

// Fix: Using gemini-3-flash-preview for financial data insights
export const getFinancialInsights = async (financialData: any) => {
  const prompt = `Analise estes indicadores financeiros da Monte Imobiliária e forneça 3 insights estratégicos rápidos em Português de Moçambique. 
  Dados: Receita: ${financialData.revenue}MT, Despesa: ${financialData.expenses}MT, Lucro: ${financialData.profit}MT, Pendentes: ${financialData.receivable}MT.`;
  return await executeWithRetry('gemini-3-flash-preview', prompt);
};

// Fix: Using gemini-3-flash-preview for general Q&A/Chat
export const chatWithMonteAI = async (userMessage: string, businessData: any) => {
  const system = `Você é o Monte AI, o cérebro estratégico do ERP Monte Imobiliária. 
  Dados Atuais: Receitas ${businessData.revenue}MT, Despesas ${businessData.expenses}MT, Staff ${businessData.employees}, Imóveis ${businessData.properties}.
  Contexto: Beira, Moçambique. Seja profissional, direto e use Português de Moçambique quando apropriado.`;
  
  return await executeWithRetry('gemini-3-flash-preview', userMessage, system);
};

export const generateJobDescription = async (jobTitle: string, area: string, location: string) => {
  const prompt = `Gere uma descrição de vaga PROFISSIONAL para "${jobTitle}" em "${area}", na Monte Imobiliária (${location}). Comece direto no título.`;
  return await executeWithRetry('gemini-3-flash-preview', prompt);
};

// Note: Keeping gemini-3-pro-preview for complex reasoning task (transforming prompts into structured technical tasks)
export const suggestTaskFromPrompt = async (userPrompt: string) => {
  const system = `Você é o Coordenador de Operações da Monte Imobiliária. Sua missão é transformar pedidos simples em tarefas estruturadas.
  Formato de resposta obrigatório:
  TITULO: [Título curto e profissional]
  PRIORIDADE: [Alta, Média ou Baixa]
  DESCRICAO: [Lista de passos técnicos ou descrição detalhada]`;

  const prompt = `Transforme este pedido em uma tarefa de gestão: "${userPrompt}"`;
  return await executeWithRetry('gemini-3-pro-preview', prompt, system);
};

// Fix: Using gemini-3-flash-preview for text enrichment/rewriting
export const enrichTaskDescription = async (title: string, currentDesc: string) => {
  const system = `Você é um Redator Técnico Especializado da Monte Imobiliária. Melhore a descrição de tarefas para que fiquem profissionais, claras e executáveis.`;
  const prompt = `Enriqueça tecnicamente esta tarefa: Título: "${title}". Descrição atual: "${currentDesc}". Forneça apenas a nova descrição.`;
  return await executeWithRetry('gemini-3-flash-preview', prompt, system);
};
