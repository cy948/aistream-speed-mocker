export interface ModelConfig {
  id: string;
  tokenSpeed: number; // tokens per second
  maxTokens: number;
  thinking?: boolean;
}

export interface ResponseConfig {
  defaultResponse: {
    text: string;
    thinking: string;
  },
  customResponses?: Record<string, string>;
}

export interface TokenGenerationStrategy {
  type: 'simple';
  options?: Record<string, unknown>;
}

export interface AppConfig {
  models: ModelConfig[];
  responses: ResponseConfig;
  tokenStrategy: TokenGenerationStrategy;
}
