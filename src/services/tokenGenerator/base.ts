import { type ModelConfig } from '@/config/types';
import { ChatCompletionChunk } from 'openai/resources';
import { getConfig } from '@/config'



export class BaseTokenGenerator {
  protected model: ModelConfig;
  protected text: string;
  protected chunkSize: number;
  protected delayMs: number;
  protected prebuiltChunks: string[] = [];
  protected config;

  constructor(model: ModelConfig, text: string) {
    this.model = model;
    this.text = text;
    this.config = getConfig();
    const { chunkSize, delayMs } = this.calculateChunkSizeAndDelay(this.model.tokenSpeed);
    this.chunkSize = chunkSize;
    this.delayMs = delayMs;
  }

  /**
   * 
   * @param tokenSpeed tokens per second
   */
  calculateChunkSizeAndDelay(tokenSpeed: number): { chunkSize: number, delayMs: number } {
    // Calculate chunk size based on token speed
    const chunkSize = this.config.tokenStrategy.default.chunkSize;
    // Consider network latency and processing delay, get the smaller one as delayMs 
    const delayMs = 1000 / (Math.max(Math.ceil(tokenSpeed / chunkSize), 1));
    return { chunkSize, delayMs };
  }

  /**
   * @function buildChunks
   * @description Prebuilds the chunks for the text
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
      // Random add chunk size to balance performace drop
      let chunkSize = this.chunkSize + Math.floor(Math.random() * this.config.tokenStrategy.default.randomRange);
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

    // Emit each chunk in OpenAI API format
    for (const chunk of this.prebuiltChunks) {
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

      // Delay based on token speed and estimated tokens in chunk
      const estimatedTokens = 1; // Default estimation
      await new Promise(resolve => setTimeout(resolve, this.delayMs * estimatedTokens));
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
