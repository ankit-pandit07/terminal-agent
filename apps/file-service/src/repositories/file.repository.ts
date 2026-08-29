import { prisma } from "../database/prisma.js";

export class FileRepository {
  async create(data: {
    userId: string;
    originalName: string;
    mimeType: string;
    size: number;
    storageKey: string;
    status: string;
    extractedText?: string;
  }) {
    return prisma.file.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.file.findUnique({
      where: {
        id,
      },
    });
  }

  async findByStorageKey(storageKey: string) {
    return prisma.file.findUnique({
      where: {
        storageKey,
      },
    });
  }

  async findByUserId(userId: string) {
    return prisma.file.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.file.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });
  }

  async delete(id: string) {
    return prisma.file.delete({
      where: {
        id,
      },
    });
  }

  async findByStorageKeyAndUser(
  storageKey: string,
  userId: string,
) {
  return prisma.file.findFirst({
    where: {
      storageKey,
      userId,
    },
  });
}

async deleteByStorageKeyAndUser(
  storageKey: string,
  userId: string,
) {
  return prisma.file.deleteMany({
    where: {
      storageKey,
      userId,
    },
  });
}
}
