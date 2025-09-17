// types.ts
export type TokenUsagePoint = { date: string; msg: number };
export type TokenUsageResponse = {
  totalTokensAvailable: number;
  totalTokensUsed: number;
  range?: string;
  points: TokenUsagePoint[];
};


export type MsgCounts = {
  msgCount: number;
  cmtCount: number;
  totalUsage: number;
  totalTokensAvailable:number;

};