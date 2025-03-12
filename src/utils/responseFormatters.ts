import { TokenGenerator } from "@/services/tokenGenerator";
import { 
  ChatCompletion, 
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
        // 创建一个 TextEncoder 实例，避免重复创建
        const encoder = new TextEncoder();
        let batchChunks = '';
        const BATCH_SIZE = 5; // 可以根据实际情况调整批处理大小
        let chunkCount = 0;
        
        // Stream each chunk
        for await (const chunk of tokenGenerator.generateTokenStream()) {
          // 仅在需要统计 token 时计算，不再存储所有 chunks
          if ('content' in chunk.choices[0]?.delta && chunk.choices[0].delta.content) {
            totalCompletionTokens += Math.ceil(chunk.choices[0].delta.content.length / 4);
          }
          
          // 将 chunk 添加到批处理中
          batchChunks += `data: ${JSON.stringify(chunk)}\n\n`;
          chunkCount++;
          
          // 达到批处理大小或者是最后一个 chunk 时发送
          if (chunkCount >= BATCH_SIZE) {
            controller.enqueue(encoder.encode(batchChunks));
            batchChunks = '';
            chunkCount = 0;
          }
        }
        
        // 发送剩余的批处理数据
        if (batchChunks) {
          controller.enqueue(encoder.encode(batchChunks));
          batchChunks = '';
        }
        
        // 准备最终的回应数据
        const finalData = 
          `data: ${JSON.stringify({
            id: streamId,
            object: "chat.completion.chunk",
            created: createdTimestamp,
            model: modelId,
            choices: [],
            usage: {
              prompt_tokens: 30,
              completion_tokens: totalCompletionTokens,
              total_tokens: 30 + totalCompletionTokens
            }
          })}\n\ndata: [DONE]\n\n`;
        
        // 只编码一次发送最终数据
        controller.enqueue(encoder.encode(finalData));
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
