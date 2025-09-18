import mongoose, { Schema} from 'mongoose';

export interface IChatMessages {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface IChatHistory{
    userId: string;
    messages: IChatMessages[];
    summary: string,
    createdAt: Date;
    updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessages>({
  role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
  content: { type: String, required: true },  
});

const ChatHistorySchema = new Schema<IChatHistory>({
    userId: { type: String, required: true },
    messages: [ChatMessageSchema],
    summary: { type: String, default: ""},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

export const ChatHistory = mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);