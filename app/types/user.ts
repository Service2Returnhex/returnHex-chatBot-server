// src/types/user.ts
export type PageInfo = {
  id: string;
  name: string;
  pageId: string;
  tokensUsed: number;
  tokensRemaining?: number;
  createdAt?: string;
};

export type TokenUsagePoint = {
  date: string; // ISO or label
  tokens: number;
};

export type TokenUsageResponse = {
  totalTokensAvailable: number;
  totalTokensUsed: number;
  range?: string;
  points: TokenUsagePoint[];
};
