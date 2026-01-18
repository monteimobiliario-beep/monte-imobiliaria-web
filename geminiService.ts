
import { GoogleGenAI } from "@google/genai";

export const getStrategicInsight = async (context: string) => {
  try {
    // Fix: Use direct initialization from process.env.API_KEY as per guidelines.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // Fix: Upgrade to 'gemini-3-pro-preview' for strategic analysis (complex reasoning task).
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Como um consultor empresarial experiente, analise estes dados e forneça uma sugestão curta e impactante para o negócio: ${context}. Responda em Português.`
    });
    // Property access .text is correct according to guidelines.
    return response.text || "Não foi possível gerar insights no momento.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Erro ao conectar com o serviço de IA.";
  }
};
