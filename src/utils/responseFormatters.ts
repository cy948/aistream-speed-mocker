import { TokenGenerator } from "@/services/tokenGenerator";
import { 
  ChatCompletion, 
  ChatCompletionChunk, 
  ChatCompletionMessage 
} from "openai/resources";

/**
 * Generate a formatted chat completion response for non-streaming requests
 */
export function createChatCompletionResponse(
  modelId: string,
  responseText: string
): ChatCompletion {
  const completionTokens = Math.ceil(responseText.length / 4); // Rough approximation
  const promptTokens = 10; // Example value

  return {
    id: `chatcmpl-${Date.now()}`,
    object: "chat.completion",
    created: Math.floor(Date.now() / 1000),
    model: modelId,
    choices: [
      {
        index: 0,
        // @ts-expect-error: necessary info included
        message: {
          role: "assistant",
          content: responseText,
        },
        finish_reason: "stop"
      }
    ],
    usage: {
      prompt_tokens: promptTokens,
      completion_tokens: completionTokens,
      total_tokens: promptTokens + completionTokens
    }
  };
}

/**
 * Create a streaming response from a token generator
 */
export async function createStreamingResponse(
  tokenGenerator: TokenGenerator,
  modelId: string
): Promise<ReadableStream<Uint8Array>> {
  const streamId = `${Date.now().toString(16)}`;
  const createdTimestamp = Math.floor(Date.now() / 1000);
  let totalCompletionTokens = 0;
  
  return new ReadableStream({
    async start(controller) {
      try {
        const chunks = [];
        
        // Stream each chunk
        for await (const chunk of tokenGenerator.generateTokenStream()) {
          chunks.push(chunk);
          
          if ('content' in chunk.choices[0]?.delta && chunk.choices[0].delta.content) {
            totalCompletionTokens += Math.ceil(chunk.choices[0].delta.content.length / 4);
          }
          
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(chunk)}\n\n`));
        }
        
        // Send a final chunk with usage information
        const finalChunk: ChatCompletionChunk = {
          id: streamId,
          object: "chat.completion.chunk",
          created: createdTimestamp,
          model: modelId,
          choices: [],
          usage: {
            prompt_tokens: 30,  // Example value, should be calculated based on input
            completion_tokens: totalCompletionTokens,
            total_tokens: 30 + totalCompletionTokens
          }
        };
        
        controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(finalChunk)}\n\n`));
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    }
  });
}

/**
 * Get the appropriate response text based on input messages
 */
export function getResponseText(
  messages: ChatCompletionMessage[] | undefined,
  customResponses: Record<string, string> | undefined,
  defaultResponse: string
): string {
  if (!messages || messages.length === 0) {
    return defaultResponse;
  }

  const lastMessage = messages[messages.length - 1];
  if (customResponses && lastMessage.content && lastMessage.content in customResponses) {
    return customResponses[lastMessage.content];
  }

  return defaultResponse;
}
