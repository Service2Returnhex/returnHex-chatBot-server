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
    mainAIModel: "gpt-5-mini",
    mainAIMaxToken: 50,

    NormaAIResponseModel: 'gpt-4o',

    messageSummarizerModel: 'gpt-4o',
    messageSummarizerMaxToken: 350,

    converstionThreshold: 30,
    keepMessages: 20,

    commentThreshold: 20,
    keepComments: 5,

    postVisibility: 5,
}