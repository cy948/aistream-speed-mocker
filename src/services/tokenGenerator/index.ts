import { FixedTokenGenerator } from './fixed';
import { ModelConfig, TokenGenerationStrategy } from '../../config/types';
import { BaseTokenGenerator } from './base';

function autoSelectTokenGenerator(tokenSpeed: number) {
  // If token speed is greater than 40, 
  // use fixed token generator to get higher performance
  if (tokenSpeed > 100) {
    return 'fixed';
  }
  return 'base';
}

export function createTokenGenerator(model: ModelConfig, text: string, strategy: TokenGenerationStrategy) {
  const tokenGeneratorType = strategy.type === 'auto' ? autoSelectTokenGenerator(model.tokenSpeed) : strategy.type;
  switch (tokenGeneratorType) {
    case 'fixed':
      return new FixedTokenGenerator(model, text);
    default:
      return new BaseTokenGenerator(model, text);
  }
}

export type TokenGenerator = BaseTokenGenerator;

export {
  BaseTokenGenerator,
  FixedTokenGenerator,
};