export type TTrainedPost = {
  name?: string;
  description?: string;
  price?: string;
  postId: string;
  message: string;
  full_picture: string;
  shopId: string;
  isTrained?: boolean;
  createdAt: Date;
  updatedAt?: Date;
};