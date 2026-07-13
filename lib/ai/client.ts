import { GoogleGenAI } from "@google/genai";
import { logger } from "@/lib/logger";
import { env } from "@/src/config/env";

const apiKey = env.GEMINI_API_KEY;

const aiClient = apiKey ? new GoogleGenAI({ apiKey }) : null;

export async function generateGeminiJson<T>(prompt: string, fallbackMockFn: () => T): Promise<T> {
  if (!aiClient) {
    logger.warn("GEMINI_API_KEY not found in environment. Using fallback AI simulation mode.");
    return fallbackMockFn();
  }

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const text = response.text;
    if (!text) {
      logger.error("Empty response text from Gemini API. Falling back to mock.");
      return fallbackMockFn();
    }

    const cleanedText = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleanedText) as T;
  } catch (error) {
    logger.error("Error invoking Gemini API, falling back to mock engine:", error);
    return fallbackMockFn();
  }
}
