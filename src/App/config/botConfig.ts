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

    NormaAIResponseModel: 'gpt-4o', //post and more info summarization

    messageSummarizerModel: 'gpt-4o',
    messageSummarizerMaxToken: 500,

    converstionThreshold: 30,
    keepMessages: 20,

    commentThreshold: 6,
    keepComments: 3,

    postVisibility: 5,

}