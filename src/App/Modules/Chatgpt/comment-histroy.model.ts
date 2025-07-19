import mongoose, { Schema } from 'mongoose';

export interface IComments {
    commentId: string;
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ICommentHistory {
    userId: string;
    postId: string;
    userName: string;
    messages: IComments[];
    createdAt: Date;
    updatedAt: Date;
}


const CommnetSchema = new Schema<IComments>({
  commentId: { type: String, required: true },
  role: { type: String, enum: ['system', 'user', 'assistant'], required: true },
  content: { type: String, required: true },  
});


const CommentHistorySchema = new Schema<ICommentHistory>({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    postId: { type: String, required: true },
    messages: [CommnetSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

export const CommentHistory = mongoose.model<ICommentHistory>("CommentHistory", CommentHistorySchema);