import mongoose, { Schema, Document } from 'mongoose';

export interface IChatMessages {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface IChatHistory extends Document {
    userId: string;
    messages: IChatMessages[];
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
})

export const ChatHistory = mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);