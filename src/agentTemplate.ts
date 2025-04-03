import { Agent } from "@mastra/core/agent";
import { Mastra } from "@mastra/core";
import { google } from "@ai-sdk/google";
import { groq } from "@ai-sdk/groq";
import dotenv from 'dotenv';

// Ensure dotenv is loaded first
dotenv.config(); 

// Verify key is loaded (optional console log for debugging)
console.log('GOOGLE_API_KEY loaded:', !!process.env.GOOGLE_API_KEY); 
if (!process.env.GOOGLE_API_KEY) {
  throw new Error('FATAL: GOOGLE_API_KEY environment variable not found!');
}

// Interface for our agent configuration
export interface AgentConfig {
  name?: string;
  instructions?: string;
  personality?: string;
  model?: string;
  maxMemoryMessages?: number;
}

/**
 * Creates a personalized agent template based on the provided configuration
 * @param config The agent configuration
 * @returns A configured Mastra Agent instance
 */
export function createAgentTemplate(config: AgentConfig = {}): Agent {
  // Default values
  const name = config.name || "Base Agent";
  const instructions = config.instructions || "You are a helpful assistant.";
  const personality = config.personality || "neutral";
  const modelName = config.model || "qwen-2.5-32b";
  
  // Build the full system prompt with personality
  const fullInstructions = `
${instructions}
Your name is ${name}.
Please respond in a ${personality} tone.
  `.trim();
  
  // Create agent with basic configuration
  // Memory settings will be handled by Mastra's defaults
  return new Agent({
    name,
    instructions: fullInstructions,
    model: groq(modelName),
    // We're using Mastra's default memory implementation
    // which handles conversation history automatically
  });
}

/**
 * Registers agents with Mastra for proper memory management and tool access
 * @param agents Object containing agent instances
 * @returns A configured Mastra instance
 */
export function registerAgents(agents: Record<string, Agent>) {
  return new Mastra({
    agents
  });
}

/**
 * Helper function to simulate a conversation with an agent
 * @param agent The agent to converse with
 * @param message The user message
 * @param threadId Optional thread ID for conversation context
 * @param resourceId Optional resource ID (typically user ID)
 * @returns The agent's response
 */
export async function simulateConversation(
  agent: Agent, 
  message: string, 
  threadId?: string, 
  resourceId?: string
): Promise<string> {
  console.log(`Simulating conversation for agent: ${agent.name}, thread: ${threadId}`);
  try {
    // Get the stream result, passing message directly and options separately
    const streamResult = agent.stream(message, {
      threadId: threadId || `thread_${Date.now()}`,
      resourceId: resourceId || `user_${Date.now()}`
    });

    // Await the stream result
    const result = await streamResult;
    console.log('SimulateConversation - Received stream result object:', result); // Log the result object structure
    let fullResponse = "";

    // Process the stream using async iteration over textStream
    console.log('SimulateConversation - Starting stream processing...');
    for await (const chunk of result.textStream) {
      console.log('SimulateConversation - Received chunk:', chunk); // Log each chunk
      fullResponse += chunk;
    }
    console.log('SimulateConversation - Finished stream processing. Full Response:', fullResponse);
    
    return fullResponse;
  } catch (error) {
    console.error("Error in simulateConversation:", error); // Log the specific error
    return "Sorry, I encountered an error while processing your request.";
  }
}

/**
 * Stream a conversation with an agent
 * @param agent The agent to converse with
 * @param message The user message
 * @param threadId Optional thread ID for conversation context
 * @param resourceId Optional resource ID (typically user ID)
 * @param onChunk Callback for each chunk of the streaming response
 */
export async function streamConversation(
  agent: Agent, 
  message: string, 
  threadId: string, 
  resourceId: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  console.log(`Streaming conversation for agent: ${agent.name}, thread: ${threadId}`);
  try {
    // Get the stream result from the agent
    const streamResult = agent.stream(message, {
      threadId,
      resourceId
    });

    let fullResponse = "";
    
    // Await the stream result
    const result = await streamResult;
    console.log('StreamConversation - Received stream result object:', result); // Log the result object structure

    // Process the stream using async iteration over textStream
    console.log('StreamConversation - Starting stream processing...');
    for await (const chunk of result.textStream) {
      console.log('StreamConversation - Received chunk:', chunk); // Log each chunk
      if (onChunk) {
        onChunk(chunk);
      }
      fullResponse += chunk;
    }
    console.log('StreamConversation - Finished stream processing. Full Response:', fullResponse);
    
    return fullResponse;
  } catch (error) {
    console.error("Error in streamConversation:", error); // Log the specific error
    return "Sorry, I encountered an error while processing your request.";
  }
}
