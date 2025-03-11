import { ModelConfig } from '../../config/types';
import { ChatCompletionChunk } from 'openai/resources';

export abstract class BaseTokenGenerator {
  protected model: ModelConfig;
  protected text: string;
  protected prebuiltChunks: string[] = [];
  
  constructor(model: ModelConfig, text: string) {
    this.model = model;
    this.text = text;
  }

  /**
   * Pre-builds all chunks before streaming them
   */
  protected abstract buildChunks(): Promise<string[]>;
  
  /**
   * Calculate milliseconds per token based on model's tokenSpeed (tokens/sec)
   */
  protected getTokenDelayMs(): number {
    // tokenSpeed is in tokens per second, so we need to convert to ms per token
    // Formula: 1000ms / tokens_per_second = ms_per_token
    const msPerToken = 1000 / this.model.tokenSpeed;
    return msPerToken;
  }
  
  /**
   * Streams the pre-built chunks at intervals based on model parameters
   */
  async *generate(): AsyncGenerator<string, void, unknown> {
    // Build all chunks first
    this.prebuiltChunks = await this.buildChunks();
    
    // Calculate delay based on token speed
    const msPerToken = this.getTokenDelayMs();
    
    // Then emit them according to the model's timing parameters
    for (const chunk of this.prebuiltChunks) {
      yield chunk;
      
      // Estimate the number of tokens in this chunk (simple approximation)
      // Most chunks are likely to be single tokens or small groups
      const estimatedTokens = 1; // Default estimation
      
      // Delay based on token speed and estimated tokens in chunk
      await new Promise(resolve => setTimeout(resolve, msPerToken * estimatedTokens));
    }
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
    
    // Calculate delay based on token speed
    const msPerToken = this.getTokenDelayMs();
    
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
      await new Promise(resolve => setTimeout(resolve, msPerToken * estimatedTokens));
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
