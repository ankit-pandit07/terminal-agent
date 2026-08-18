import { prisma } from "../db/prisma.js";
import type {
  CreateMemoryInput,
  MemoryRecord,
  MemorySearchOptions,
} from "./memory.types.js";

export class MemoryRepository {
  async create(input: CreateMemoryInput) {
    return prisma.agentMemory.create({
      data: {
        conversationId: input.conversationId ?? null,
        executionId: input.executionId ?? null,
        type: input.type,
        key: input.key,
        value: input.value,
      },
    });
  }

  async findById(id: string) {
    return prisma.agentMemory.findUnique({
      where: {
        id,
      },
    });
  }

  async search(options: MemorySearchOptions): Promise<MemoryRecord[]> {
    const where: any = {};

    if (options.conversationId) {
      where.conversationId = options.conversationId;
    }

    if (options.executionId) {
      where.executionId = options.executionId;
    }

    if (options.type) {
      where.type = options.type;
    }

    if (options.key) {
      where.key = { contains: options.key, mode: "insensitive" };
    }

    if (options.query) {
      where.OR = [
        {
          key: {
            contains: options.query,
            mode: "insensitive",
          },
        },
        {
          value: {
            contains: options.query,
            mode: "insensitive",
          },
        },
      ];
    }
    const memories = await prisma.agentMemory.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    });

    return memories.map((memory) => ({
      id: memory.id,
      conversationId: memory.conversationId,
      executionId: memory.executionId,
      type: memory.type as MemoryRecord["type"],
      key: memory.key,
      value: memory.value,
      createdAt: memory.createdAt,
    }));
  }

  async findRecent(limit = 20) {
    return prisma.agentMemory.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async delete(id: string) {
    return prisma.agentMemory.delete({
      where: {
        id,
      },
    });
  }

  async clearConversation(conversationId: string) {
    return prisma.agentMemory.deleteMany({
      where: {
        conversationId,
      },
    });
  }
}
