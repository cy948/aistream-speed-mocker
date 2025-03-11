export interface ModelConfig {
  id: string;
  tokenSpeed: number; // tokens per second
  maxTokens: number;
}

export interface ResponseConfig {
  defaultResponse: string;
  customResponses?: Record<string, string>;
}

export interface TokenGenerationStrategy {
  type: 'simple';
  options?: Record<string, any>;
}

export interface AppConfig {
  models: ModelConfig[];
  responses: ResponseConfig;
  tokenStrategy: TokenGenerationStrategy;
}
