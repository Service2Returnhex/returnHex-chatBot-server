import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  //   project: process.env.GOOGLE_CLOUD_PROJECT,
});

export async function generateGeminiReply(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  return response.text || "Sorry, I couldn't generate a response right now.";
}
