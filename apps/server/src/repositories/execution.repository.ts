import { ExecutionStatus } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export class ExecutionRepository {
  async create(conversationId: string, goal: string, userId?: string) {
    return prisma.execution.create({
      data: {
        conversationId,
        goal,
        status: ExecutionStatus.RUNNING,
        userId: userId ?? null,
      },
    });
  }

  async findById(id: string, userId?: string) {
    const execution = await prisma.execution.findUnique({
      where: { id },
      include: {
        toolExecutions: {
          orderBy: {
            createdAt: "asc",
          },
        },
        conversation: true,
      },
    });

    if (!execution) return null;

    if (userId) {
      if (execution.userId && execution.userId !== userId) return null;
      if (execution.conversation.userId && execution.conversation.userId !== userId) return null;
    }

    return execution;
  }

  async updateStatus(id: string, status: ExecutionStatus) {
    return prisma.execution.update({
      where: { id },
      data: {
        status,
        finishedAt: new Date(),
      },
    });
  }

  async findByConversation(conversationId: string, userId?: string) {
    if (userId) {
      const conv = await prisma.conversation.findUnique({
        where: { id: conversationId },
      });
      if (!conv || (conv.userId && conv.userId !== userId)) {
        return [];
      }
    }

    return prisma.execution.findMany({
      where: {
        conversationId,
      },
      include: {
        toolExecutions: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
    });
  }

  async deleteByConversation(conversationId: string) {
    return prisma.execution.deleteMany({
      where: {
        conversationId,
      },
    });
  }
}
