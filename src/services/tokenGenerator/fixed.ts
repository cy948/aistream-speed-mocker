import { ChatCompletionChunk } from 'openai/resources';
import { BaseTokenGenerator } from './base';
import { type ModelConfig } from '@/config/types';

export class FixedTokenGenerator extends BaseTokenGenerator {
  constructor(model: ModelConfig, text: string) {
    super(model, text);
    const { chunkSize, delayMs } = this.calculateChunkSizeAndDelay(model.tokenSpeed)
    this.delayMs = delayMs 
    this.chunkSize = chunkSize
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

  /**
 * Generates token stream in OpenAI API format
 * This is used for simulating the streaming response
 */
  async *generateTokenStream(): AsyncGenerator<ChatCompletionChunk, void, unknown> {
    // Create a unique stream ID
    const streamId = `chatcmpl-${Date.now().toString(16)}`;
    const createdTimestamp = Math.floor(Date.now() / 1000);

    // Build all chunks first
    this.prebuiltChunks = await this.buildChunks();

    // Efficient delay function using setImmediate for better IO performance
    const efficientDelay = (ms: number): Promise<void> => {
      if (ms <= 0) return Promise.resolve();
      
      return new Promise(resolve => {
        const startTime = Date.now();
        const checkTime = () => {
          if (Date.now() - startTime >= ms) {
            resolve();
          } else {
            setImmediate(checkTime);
          }
        };
        setImmediate(checkTime);
      });
    };

    // Batch size for processing chunks (can be adjusted based on performance testing)
    const batchSize = Math.min(10, this.prebuiltChunks.length);
    
    // Process chunks in smaller batches to avoid blocking the event loop
    for (let i = 0; i < this.prebuiltChunks.length; i++) {
      const chunk = this.prebuiltChunks[i];
      
      const response: ChatCompletionChunk = {
        id: streamId,
        object: "chat.completion.chunk",
        created: createdTimestamp,
        model: this.model.id,
        choices: [
          {
            index: 0,
            delta: {
              content: chunk
            },
            finish_reason: null
          }
        ]
      };

      yield response;

      // Use more efficient timer and allow event loop to breathe
      if (this.delayMs > 0) {
        await efficientDelay(this.delayMs);
      } else {
        // Use process.nextTick for minimal delay when delayMs is 0
        await new Promise(resolve => process.nextTick(resolve));
      }

      // Give the event loop a chance to handle other tasks every few chunks
      if (i % batchSize === 0 && i > 0) {
        await new Promise(resolve => setImmediate(resolve));
      }
    }

    // Send a final chunk with finish_reason
    const finalChunk: ChatCompletionChunk = {
      id: streamId,
      object: "chat.completion.chunk",
      created: createdTimestamp,
      model: this.model.id,
      choices: [
        {
          index: 0,
          delta: {},
          finish_reason: "stop"
        }
      ]
    };

    yield finalChunk;
  }
}
