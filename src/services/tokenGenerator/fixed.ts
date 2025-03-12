import { BaseTokenGenerator } from './base';
import { type ModelConfig } from '@/config/types';

export class FixedTokenGenerator extends BaseTokenGenerator {
  constructor(model: ModelConfig, text: string) {
    super(model, text);
    const {chunkSize, delayMs} = this.calculateChunkSizeAndDelay(model.tokenSpeed)
    this.delayMs = chunkSize
    this.chunkSize = delayMs
  }

  calculateChunkSizeAndDelay(tokenSpeed: number): { chunkSize: number; delayMs: number; } {
    // Use a fixed delayMs to send message
    let newDelayMs = this.config.tokenStrategy.fixed.delayMs;
    // Adjust chunk size based on token speed
    let newChunkSize = Math.max(1, Math.floor(newDelayMs * tokenSpeed / 1000));
    return { chunkSize: newChunkSize, delayMs: newDelayMs };
  }

  /**
   * Splits the text into simple token chunks
   * This is a very basic implementation that just splits by characters
   * or small groups of characters
   */
  protected async buildChunks(): Promise<string[]> {
    const chunks: string[] = [];
    
    // Handle empty text case
    if (!this.text || this.text.length === 0) {
      return chunks;
    }
    
    // Simple character-by-character approach with occasional grouping
    let currentIndex = 0;
    
    while (currentIndex < this.text.length) {
      let chunkSize = Math.max(1, this.chunkSize + Math.floor(Math.random() * this.config.tokenStrategy.fixed.randomRange));
      const endIndex = Math.min(currentIndex + chunkSize, this.text.length);
      
      // Get the chunk
      const chunk = this.text.substring(currentIndex, endIndex);
      chunks.push(chunk);
      
      // Move to next position
      currentIndex = endIndex;
    }
    
    return chunks;
  }
}
