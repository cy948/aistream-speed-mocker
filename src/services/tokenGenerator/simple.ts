import { BaseTokenGenerator } from './base';
import { ModelConfig } from '../../config/types';

export class SimpleTokenGenerator extends BaseTokenGenerator {
  constructor(model: ModelConfig, text: string) {
    super(model, text);
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
      // Randomly decide to group 1-3 characters together
      const chunkSize = Math.floor(Math.random() * 3) + 1;
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
