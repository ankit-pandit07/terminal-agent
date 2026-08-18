import { ExecutionStatus } from "@prisma/client";
import { prisma } from "../db/prisma.js";

export class ExecutionRepository {
  async create(conversationId: string, goal: string) {
    return prisma.execution.create({
      data: {
        conversationId,
        goal,
        status: ExecutionStatus.RUNNING,
      },
    });
  }

  async findById(id: string) {
    return prisma.execution.findUnique({
      where: { id },
      include: {
        toolExecutions: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
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
  async findByConversation(conversationId: string) {
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
