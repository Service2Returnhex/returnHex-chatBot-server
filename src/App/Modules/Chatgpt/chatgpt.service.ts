import OpenAI from "openai";

const getResponse = async(body: any) => {

    const message = body.message;

    const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
    })

    const result = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        store: true,
        messages: [
            {
                role: "user",
                content: message
            }
        ]
    })

    return result.choices[0].message.content
}


export const ChatgptService = {
    getResponse
}