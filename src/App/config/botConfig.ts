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

    NormaAIResponseModel: 'gpt-3.5-turbo', //post and more info summarization

    messageSummarizerModel: 'gpt-3.5-turbo',
    messageSummarizerMaxToken: 150,

    converstionThreshold: 10,
    keepMessages: 5

}