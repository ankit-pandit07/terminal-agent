import { prisma } from "../db/prisma.js";

function createConversationTitle(message: string): string {
  // Remove markdown code fences, headers, extra whitespace
  const clean = message
    .replace(/```[\s\S]*?```/g, "")
    .replace(/^#+\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!clean) {
    return "New Conversation";
  }

  // Maximum 60 characters for DB title
  if (clean.length <= 60) {
    return clean;
  }

  return `${clean.slice(0, 57)}...`;
}

export class ConversationRepository {
  async create(message: string, userId?: string) {
    return prisma.conversation.create({
      data: {
        title: createConversationTitle(message),
        userId: userId ?? null,
      },
    });
  }

  async findAll(userId?: string) {
    return prisma.conversation.findMany({
      where: userId ? { userId } : {},
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async findById(id: string, userId?: string) {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
        executions: {
          orderBy: {
            startedAt: "desc",
          },
        },
      },
    });

    if (!conversation) return null;

    // Enforce strict ownership if userId is specified
    if (userId && conversation.userId !== userId) {
      return null;
    }

    return conversation;
  }

  async delete(id: string, userId?: string) {
    if (userId) {
      const conv = await prisma.conversation.findUnique({ where: { id } });
      if (!conv || conv.userId !== userId) {
        throw new Error("Conversation not found or unauthorized");
      }
    }

    return prisma.conversation.delete({
      where: {
        id,
      },
    });
  }

  async findRecent(limit = 20, userId?: string) {
    return prisma.conversation.findMany({
      where: userId ? { userId } : {},
      take: limit,
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async updateTimestamp(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }
}