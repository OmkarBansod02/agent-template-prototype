import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { Agent } from '@mastra/core';
import { Mastra } from "@mastra/core";
import { createAgentTemplate, AgentConfig, registerAgents, simulateConversation } from './agentTemplate';
import dotenv from 'dotenv';

dotenv.config();

// Ensure Groq API key is present
if (!process.env.GROQ_API_KEY) {
  throw new Error('FATAL: GROQ_API_KEY environment variable not found!');
}

// Initialize Express app for API endpoint
const app = express();
app.use(express.json());

// Store created agents for the session
const agentInstances: Record<string, Agent<any, any>> = {};
let mastraInstance: Mastra;

// Types for request parameters
interface InteractParams {
  agentId: string;
}

interface InteractRequest extends Request<InteractParams> {
  body: {
    message: string;
    threadId?: string;
    resourceId?: string;
  };
}

// Define route handlers with correct types
const createAgentHandler: RequestHandler = (req, res, next) => {
  try {
    // Get configuration from request body
    const config = req.body;
    
    // Validate required fields
    if (!config) {
      res.status(400).json({
        status: 'error',
        message: 'Missing agent configuration'
      });
      return;
    }
    
    // Generate a unique agent ID if not provided
    const agentId = config.name?.toLowerCase().replace(/\s+/g, '_') || `agent_${Date.now()}`;
    
    // Create a new agent with the provided configuration
    const agent = createAgentTemplate(config);
    
    // Store the agent instance
    agentInstances[agentId] = agent;
    
    // Register agents with Mastra
    mastraInstance = registerAgents(agentInstances);
    
    // Return success response with agent details
    res.status(200).json({
      status: 'success',
      agent: {
        id: agentId,
        name: config.name || 'Base Agent',
        instructions: config.instructions || 'You are a helpful assistant.',
        personality: config.personality || 'neutral',
        model: config.model || 'qwen-2.5-32b',
        maxMemoryMessages: config.maxMemoryMessages || 10,
      }
    });
  } catch (error) {
    next(error);
  }
};
const interactAgentHandler: RequestHandler<InteractParams> = async (req, res, next) => {
  try {
    const { agentId } = req.params;
    const { message, threadId, resourceId } = req.body;
    
    // Validate required fields
    if (!message) {
      res.status(400).json({
        status: 'error',
        message: 'Missing message'
      });
      return;
    }
    
    // Check if agent exists
    const agent = agentInstances[agentId];
    if (!agent) {
      res.status(404).json({
        status: 'error',
        message: `Agent with ID ${agentId} not found`
      });
      return;
    }
    
    try {
      // Get response from agent using our simulateConversation helper
      const response = await simulateConversation(
        agent, 
        message, 
        threadId || `thread_${Date.now()}`,
        resourceId || `user_${Date.now()}`
      );
      
      // Return success response with agent response
      res.status(200).json({
        status: 'success',
        response,
        threadId: threadId || `thread_${Date.now()}`,
        resourceId: resourceId || `user_${Date.now()}`
      });
    } catch (agentError) {
      console.error('Error in agent response:', agentError);
      res.status(500).json({
        status: 'error',
        message: 'Agent failed to process the message',
        error: agentError instanceof Error ? agentError.message : String(agentError)
      });
    }
  } catch (error) {
    next(error);
  }
};

const healthCheckHandler: RequestHandler = (req, res, next) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Server is running',
    agents: Object.keys(agentInstances).length
  });
};

// Assign handlers to routes
app.post('/create-agent', createAgentHandler);
app.post('/interact/:agentId', interactAgentHandler);
app.get('/health', healthCheckHandler);

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: err.message
  });
});

// Define port for Express API
const PORT = process.env.PORT || 3000;

// Start the Express server for the API
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
  console.log(`API endpoints available at:`);
  console.log(`  - http://localhost:${PORT}/create-agent [POST]`);
  console.log(`  - http://localhost:${PORT}/interact/:agentId [POST]`);
  console.log(`  - http://localhost:${PORT}/health [GET]`);
});

export { app };