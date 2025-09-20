
export type IImageItem={
   url: string;
  // photoId?: number;
  caption?: string;
  embedding?: number[]; // embedding for this image
  phash?: string;
}
export type TPost = {
  id: string;
  message: string;
  full_picture: string;
  summarizedMsg:string;
  images?: IImageItem[];
  aggregatedEmbedding?:number[];
  isTrained:boolean;
  created_time: Date;
};
  