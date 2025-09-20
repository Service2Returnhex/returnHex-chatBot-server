import mongoose, { Schema } from 'mongoose';

export interface IChatMessages {
    role: 'system' | 'user' | 'assistant';
    content: string;
     createdAt: Date;
    updatedAt: Date;
}

export interface IChatHistory{
    userId: string;
    messages: IChatMessages[];
    summary: string,
    shopId:string;
    createdAt: Date;
    updatedAt: Date;
}

const ChatMessageSchema = new Schema<IChatMessages>({
  role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
  content: { type: String, required: true },  
   createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const ChatHistorySchema = new Schema<IChatHistory>({
    userId: { type: String, required: true },
    messages: [ChatMessageSchema],
    summary: { type: String, default: ""},
    shopId:{type:String,required:true},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
})

export const ChatHistory = mongoose.model<IChatHistory>("ChatHistory", ChatHistorySchema);