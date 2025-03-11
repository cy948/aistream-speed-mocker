import { SimpleTokenGenerator } from './simple';
import { ModelConfig, TokenGenerationStrategy } from '../../config/types';
import { BaseTokenGenerator } from './base';

export function createTokenGenerator(model: ModelConfig, text: string, strategy: TokenGenerationStrategy) {
  switch (strategy.type) {
    case 'simple':
    default:
      return new SimpleTokenGenerator(model, text);
  }
}

export type TokenGenerator = BaseTokenGenerator;

export {
  BaseTokenGenerator,
  SimpleTokenGenerator,
};