# Dynamic Personalized Agent Template Prototype for Mastra AI

This project demonstrates a flexible and scalable approach to dynamically creating personalized AI agents on demand using the Mastra AI framework. Companies can leverage this prototype to offer tailored AI assistants to their users by utilizing Mastra's robust agent system with customizable attributes.

## Concept

The Dynamic Personalized Agent Template Prototype provides several key benefits:

- **Scalability**: Use a single base template to create unlimited unique agent instances
- **Customization**: Personalize agents with unique names, instructions, personalities, and memory settings
- **Consistency**: Maintain core functionality while varying presentation and behavior
- **Efficiency**: Reuse code and infrastructure while delivering personalized experiences
- **Memory Management**: Utilize Mastra's built-in memory management for maintaining conversation context

This enables companies to create unique AI experiences for each user without having to maintain separate codebases for each agent variant.

## Project Structure

```
├── agentTemplate.ts   # Core agent template module using Mastra framework
├── server.ts          # Express API server with endpoints for agent creation/interaction
├── demo.ts            # CLI demo application for testing
├── package.json       # Project dependencies and scripts
└── tsconfig.json      # TypeScript configuration
```

## Mastra Integration

This project leverages the Mastra AI framework for creating and managing agents. Mastra provides:

- Agent creation and management
- Built-in memory management via threads and resources
- Streaming responses for real-time interactions
- Tool integration capabilities for more advanced functionality

## Base Template

The `createAgentTemplate` function serves as the foundation for generating personalized agents using Mastra's `Agent` class. It accepts a configuration object that allows customization of:

- **name**: Custom agent name (default: "Base Agent")
- **instructions**: Behavior guidelines (default: "You are a helpful assistant.")
- **personality**: Tone/style such as "friendly", "formal", etc. (default: "neutral")
- **model**: AI model selection (default: "gpt-4o-mini")
- **maxMemoryMessages**: Maximum conversation history size (default: 10)

### Usage Example

```typescript
import { createAgentTemplate } from './agentTemplate';

// Create a personalized agent
const myAgent = createAgentTemplate({
  name: "TechHelper",
  instructions: "You are a technical support assistant specializing in JavaScript.",
  personality: "technical",
  model: "gpt-4o-mini",
  maxMemoryMessages: 15
});

// Register the agent with Mastra
import { registerAgents } from './agentTemplate';
const mastra = registerAgents({ techHelper: myAgent });

// Generate a response
const threadId = `thread_${Date.now()}`;
const resourceId = `user_${Date.now()}`;
const response = await simulateConversation(myAgent, "How do I debug my React app?", threadId, resourceId);
console.log(response);

// For streaming responses
import { streamConversation } from './agentTemplate';
await streamConversation(
  myAgent, 
  "How do I debug my React app?", 
  threadId, 
  resourceId, 
  chunk => console.log(chunk)
);
```

## Memory Integration

Mastra handles memory management through its thread and resource system:

- **Threads**: Represent conversations or contexts
- **Resources**: Represent users or entities participating in conversations
- **Memory API**: Automatically maintains conversation history and context

Each agent interaction requires a threadId and resourceId to properly maintain conversation context.

## API Usage

The project includes a REST API built with Express.js that allows creating personalized agents dynamically.

### Create Agent Endpoint

**POST /create-agent**

Example curl command:

```bash
curl -X POST http://localhost:3000/create-agent \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FriendlyBot",
    "instructions": "You are a cheerful assistant who loves to help!",
    "personality": "friendly",
    "model": "gpt-4o-mini",
    "maxMemoryMessages": 5
  }'
```

Response:

```json
{
  "status": "success",
  "agent": {
    "id": "friendlybot",
    "name": "FriendlyBot",
    "instructions": "You are a cheerful assistant who loves to help!",
    "personality": "friendly",
    "model": "gpt-4o-mini",
    "maxMemoryMessages": 5
  }
}
```

### Interact with Agent Endpoint

**POST /interact/:agentId**

Example curl command:

```bash
curl -X POST http://localhost:3000/interact/friendlybot \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how are you?",
    "threadId": "thread_12345",
    "resourceId": "user_67890"
  }'
```

Response:

```json
{
  "status": "success",
  "response": "Hi there! I'm doing great and I'm so happy to help you today! What can I assist you with?",
  "threadId": "thread_12345",
  "resourceId": "user_67890"
}
```

## CLI Demo

The project includes a command-line interface (CLI) demo that allows you to:

1. Configure a personalized agent with custom attributes
2. Simulate a conversation with the agent using Mastra's streaming capabilities
3. Track conversation context with threadId and resourceId

To run the demo:

```bash
npm run demo
```

Example interaction:

```
=== Mastra AI: Dynamic Personalized Agent Template Prototype ===

Enter agent name: FriendlyBot
Enter instructions: You are a cheerful assistant who loves to help!
Enter personality (friendly, formal, technical, neutral): friendly
Enter maximum memory messages (default: 10): 5

Creating your personalized agent...

Agent created successfully!

Name: FriendlyBot
Instructions: You are a cheerful assistant who loves to help!
Personality: friendly
Model: gpt-4o-mini
Max Memory Messages: 5

=== Starting Conversation Simulation ===

Thread ID: thread_1685432789
Resource ID: user_1685432789

Enter your message (or type "exit" to quit): Hello, how are you?

Processing...

FriendlyBot: 
Hi there! I'm doing fantastic today, thanks for asking! I'm super excited to chat with you and help with whatever you need. How can I assist you today? Is there something specific you're looking for help with?

Message 1 processed.
Thread ID: thread_1685432789
Resource ID: user_1685432789
```

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your OpenAI API key:
   ```bash
   # Create a .env file and add:
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the server:
   ```bash
   npm start
   ```
5. Run the demo:
   ```bash
   npm run demo
   ```

## Technical Details

- **Language**: TypeScript
- **Framework**: Express.js for API server
- **AI Framework**: Mastra AI for agent management
- **AI Provider**: OpenAI via @ai-sdk/openai
- **Dependencies**: 
  - @mastra/core - Core Mastra framework
  - @ai-sdk/openai - OpenAI integration
  - express - API server
  - typescript/ts-node - Language and runtime

## Extending the Prototype

This prototype can be extended in various ways:

1. Add Mastra tool integrations for enhanced agent capabilities
2. Implement user authentication and agent ownership
3. Add more customization options (voice, visual appearance, specialized knowledge)
4. Integrate with additional AI models supported by Mastra
5. Build a web interface for agent creation and interaction
#   a g e n t - t e m p l a t e - p r o t o t y p e  
 