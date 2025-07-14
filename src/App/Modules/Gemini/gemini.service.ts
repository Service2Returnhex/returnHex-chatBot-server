import { GoogleGenAI } from "@google/genai";


const getResponse = async (body: any) => {
    const ai = new GoogleGenAI({});

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: body.message
    })

    return response.text;
}

export const GeminiService = {

    getResponse
}