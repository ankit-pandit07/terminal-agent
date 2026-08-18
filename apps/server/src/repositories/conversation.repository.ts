import { prisma } from "../db/prisma.js";

function createConversationTitle(message: string) {
  const title = message
    .trim()
    .replace(/\s+/g, " ");

  if (!title) {
    return "New Conversation";
  }

  // Maximum 60 characters
  if (title.length <= 60) {
    return title;
  }

  return `${title.slice(0, 57)}...`;
}

export class ConversationRepository {
  async create(message: string) {
    return prisma.conversation.create({
      data: {
        title: createConversationTitle(message),
      },
    });
  }

  async findAll() {
    return prisma.conversation.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
  }

  async findById(id: string) {
    return prisma.conversation.findUnique({
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
  }

  async delete(id: string) {
    return prisma.conversation.delete({
      where: {
        id,
      },
    });
  }

  async findRecent(limit = 10) {
    return prisma.conversation.findMany({
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });
  }
}