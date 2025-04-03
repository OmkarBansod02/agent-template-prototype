import readline from 'readline';
import { createAgentTemplate, AgentConfig, registerAgents, streamConversation } from './agentTemplate';

// Create readline interface for CLI interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to ask a question and return the answer as a promise
function ask(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Main demo function
async function runDemo() {
  console.log('\n=== Mastra AI: Dynamic Personalized Agent Template Prototype ===\n');
  
  try {
    // Collect agent configuration from user
    const config: AgentConfig = {};
    
    // Get agent name
    config.name = await ask('Enter agent name: ');
    if (!config.name) config.name = 'Demo Agent';
    
    // Get agent instructions
    config.instructions = await ask('Enter instructions: ');
    if (!config.instructions) config.instructions = 'You are a helpful assistant.';
    
    // Get agent personality
    config.personality = await ask('Enter personality (friendly, formal, technical, neutral): ');
    if (!config.personality) config.personality = 'neutral';
    
    // Get maximum memory messages
    const maxMemoryInput = await ask('Enter maximum memory messages (default: 10): ');
    config.maxMemoryMessages = maxMemoryInput ? parseInt(maxMemoryInput, 10) : 10;
    
    // Create the personalized agent
    console.log('\nCreating your personalized agent...');
    const agent = createAgentTemplate(config);
    
    // Register the agent with Mastra
    registerAgents({ [config.name.toLowerCase().replace(/\s+/g, '_')]: agent });
    
    console.log(`\nAgent created successfully!\n`);
    console.log(`Name: ${config.name}`);
    console.log(`Instructions: ${config.instructions}`);
    console.log(`Personality: ${config.personality}`);
    console.log(`Model: ${config.model || 'gemini-1.5-flash-latest'}`);
    console.log(`Max Memory Messages: ${config.maxMemoryMessages}`);
    
    // Simulate a conversation
    console.log('\n=== Starting Conversation Simulation ===\n');
    
    // Generate unique IDs for thread and resource
    const threadId = `thread_${Date.now()}`;
    const resourceId = `user_${Date.now()}`;
    
    console.log(`Thread ID: ${threadId}`);
    console.log(`Resource ID: ${resourceId}`);
    
    // Process user messages until they type 'exit'
    let userMessage = '';
    let messageCounter = 0;
    
    while (userMessage.toLowerCase() !== 'exit') {
      messageCounter++;
      userMessage = await ask('\nEnter your message (or type "exit" to quit): ');
      
      if (userMessage.toLowerCase() === 'exit') {
        break;
      }
      
      // Get agent response with streaming for better UX
      console.log('\nProcessing...');
      
      let fullResponse = '';
      let responseStarted = false;
      
      console.log(`\n${config.name}: `);
      
      // Stream the response for better UX
      fullResponse = await streamConversation(
        agent,
        userMessage,
        threadId,
        resourceId,
        (chunk) => {
          // Print chunk as it arrives for better UX
          process.stdout.write(chunk);
          if (!responseStarted) responseStarted = true;
        }
      );
      
      console.log('\n');
      console.log(`\nMessage ${messageCounter} processed.`);
      console.log(`Thread ID: ${threadId}`);
      console.log(`Resource ID: ${resourceId}`);
    }
    
    console.log('\nThank you for using the Mastra AI Personalized Agent Demo!');
  } catch (error) {
    console.error('Error in demo:', error);
  } finally {
    // Close the readline interface
    rl.close();
  }
}

// Start the demo
console.log('Starting Mastra AI Personalized Agent Demo...');
runDemo();
