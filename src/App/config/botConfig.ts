type TBotConfig = {
    mainAIModel: string;
    mainAIMaxToken: number;

    messageSummarizerModel: string;
    messageSummarizerMaxToken: number;

    NormaAIResponseModel: string;
    
    converstionThreshold: number;
    keepMessages: number;

    commentThreshold: number,
    keepComments: number,


    postVisibility: number
}

export const botConfig: TBotConfig = {
    mainAIModel: "gpt-4.1-nano",
    mainAIMaxToken: 100,

    NormaAIResponseModel: 'gpt-4.1-nano',

    messageSummarizerModel: 'gpt-4.1-nano',
    messageSummarizerMaxToken: 250,

    converstionThreshold: 20,
    keepMessages: 10,

    commentThreshold: 10,
    keepComments: 5,

    postVisibility: 5,
}