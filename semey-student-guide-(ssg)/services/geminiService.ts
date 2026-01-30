
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Normalizes raw student feedback into a neutral "community signal".
 */
export async function normalizeFeedback(rawText: string): Promise<{ signal: string; status: 'neutral' | 'warning' | 'positive' }> {
  // Always initialize GoogleGenAI inside the function as recommended
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Normalize this student feedback about a local business in Semey into a neutral, short community signal. 
      Rules: No naming individuals, no inflammatory language, no accusations. 
      If negative, use "Reported uncomfortable experience". 
      If positive, use "High student satisfaction". 
      Feedback: "${rawText}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            signal: { type: Type.STRING },
            status: { type: Type.STRING, enum: ['neutral', 'warning', 'positive'] }
          },
          required: ['signal', 'status']
        }
      }
    });

    // Directly access .text property from GenerateContentResponse
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini normalization error:", error);
    return { signal: "Recent community update", status: 'neutral' };
  }
}

/**
 * Uses Google Maps grounding to find real establishments in Semey.
 */
export async function discoverPlacesInSemey(query: string) {
  // Always initialize GoogleGenAI inside the function as recommended
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find real, student-friendly ${query} in Semey, Kazakhstan. 
      Provide a list of places with their exact names, types, and brief descriptions of why they are good for students.`,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: 50.4165,
              longitude: 80.2450
            }
          }
        }
      },
    });

    // The model returns a text description, but the grounding metadata contains the structured place data.
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    // Directly access .text property from GenerateContentResponse
    const text = response.text;
    
    return { text, chunks };
  } catch (error) {
    console.error("Discovery error:", error);
    return null;
  }
}
