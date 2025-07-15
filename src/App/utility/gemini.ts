import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
  //   project: process.env.GOOGLE_CLOUD_PROJECT,
  vertexai: true,
});

export async function generateGeminiReply(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Sorry, I couldn't generate a response right now.";
  } catch (error) {
    console.error("Error generating content:", error);
    return "An error occurred while generating the response.";
  }
}
