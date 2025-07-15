import { GenerateContentResponse, GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
dotenv.config();
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});
//   project: process.env.GOOGLE_CLOUD_PROJECT,

export async function generateGeminiReply(prompt: string): Promise<string> {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "⚠️ No text received from Gemini";
  } catch (err: any) {
    if (err.code === 429) {
      console.warn("Rate limit hit, backing off…");
      await new Promise((r) => setTimeout(r, 2000));
    }
    console.error("Gemini API error:", err);
    return "An error occurred while generating the response.";
  }
}
