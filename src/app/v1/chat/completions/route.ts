import { NextRequest, NextResponse } from 'next/server';
import { getConfig, getModelById } from '@/config';
import { createTokenGenerator } from '@/services/tokenGenerator';
import { 
  createChatCompletionResponse, 
  createStreamingResponse, 
  getResponseText 
} from '@/utils/responseFormatters';

export async function POST(request: NextRequest) {
  const config = getConfig();
  const body = await request.json();
  
  // Get model from request or use default
  const modelId = body.model || 'gpt-3.5-turbo';
  const model = getModelById(modelId);
  
  if (!model) {
    return NextResponse.json({
      error: {
        message: `Model ${modelId} not found`,
        type: "invalidRequestError",
        code: "modelNotFound"
      }
    }, { status: 404 });
  }
  
  // Get appropriate response text
  const responseText = getResponseText(
    body.messages, 
    config.responses.customResponses, 
    model?.thinking? config.responses.defaultResponse.thinking : config.responses.defaultResponse.text
  );
  
  // Check if stream is requested
  const stream = body.stream === true;
  if (!stream) {
    // For non-streaming responses, return immediate response
    const response = createChatCompletionResponse(modelId, responseText);
    return NextResponse.json(response);
  }
  
  // For streaming responses, use the configured token generator
  try {
    // Create token generator based on config strategy
    const tokenGenerator = createTokenGenerator(model, responseText, config.tokenStrategy);
    
    // Create a stream
    const stream = await createStreamingResponse(tokenGenerator, modelId);
    
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });
  } catch (error) {
    console.error('Error generating token stream:', error);
    return NextResponse.json({
      error: {
        message: "An error occurred while generating the token stream",
        type: "serverError",
        code: "internalError"
      }
    }, { status: 500 });
  }
}