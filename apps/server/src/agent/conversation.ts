import { ConversationRepository } from "../repositories/conversation.repository.js";
import { MessageRepository } from "../repositories/message.repository.js";
import { ExecutionRepository } from "../repositories/execution.repository.js";
import { ToolExecutionRepository } from "../repositories/tool-execution.repository.js";

const conversationRepository = new ConversationRepository();
const messageRepository = new MessageRepository();
const executionRepository = new ExecutionRepository();
const toolExecutionRepository = new ToolExecutionRepository();

export async function deleteConversation(conversationId: string) {
  const conversation = await conversationRepository.findById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }
  
  // delete toolExecutions
  for (const execution of conversation.executions) {
    await toolExecutionRepository.deleteByExecution(execution.id);
  }
  
  // delete executions
  await executionRepository.deleteByConversation(conversationId);

  // delete messages
  await messageRepository.deleteByConversation(conversationId);

  // delete conversation
  await conversationRepository.delete(conversationId);

  return {
    success: true,
    message: "Conversation deleted successfully",
  };
}

export async function getConversation(conversationId: string) {
  const conversation = await conversationRepository.findById(conversationId);

  if (!conversation) {
    throw new Error("Conversation not found");
  }
  return conversation;
}

export async function getExecutions(conversationId: string) {
  const conversation = await conversationRepository.findById(conversationId);
  if (!conversation) {
    throw new Error("Conversation not found");
  }

  return executionRepository.findByConversation(conversationId);
}

export async function getExecution(executionId:string){
  const execution=await executionRepository.findById(executionId);

  if(!execution){
    throw new Error("Execution not found");
  }

  return execution;
}

export async function getHistory() {
  return conversationRepository.findAll();
}