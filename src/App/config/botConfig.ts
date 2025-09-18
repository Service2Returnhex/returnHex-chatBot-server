type TBotConfig = {
    mainAIModel: string;
    mainAIMaxToken: number;

    messageSummarizerModel: string;
    messageSummarizerMaxToken: number;

    NormaAIResponseModel: string;
    
    converstionThreshold: number,
    keepMessages: number
}

export const botConfig: TBotConfig = {
    mainAIModel: "gpt-5-mini",
    mainAIMaxToken: 50,

    NormaAIResponseModel: 'gpt-4o', //post and more info summarization

    messageSummarizerModel: 'gpt-4o',
    messageSummarizerMaxToken: 200,

    converstionThreshold: 15,
    keepMessages: 7

}