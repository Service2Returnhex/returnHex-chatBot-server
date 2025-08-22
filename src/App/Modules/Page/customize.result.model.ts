export type CustomMsg = {
  index: number;
  role: "user" | "assistant" | "system";
  original: string;
  customized: string;
};

export type CustomizationResult = {
  customizedMessages: CustomMsg[];
  summary: string;
  actions: string[];
  rawModelOutput: string;
};