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

  async findByStorageKeyAndUser(storageKey: string, userId: string) {
    return prisma.file.findFirst({
      where: {
        storageKey,
        userId,
      },
    });
  }

  async deleteByStorageKeyAndUser(storageKey: string, userId: string) {
    return prisma.file.deleteMany({
      where: {
        storageKey,
        userId,
      },
    });
  }

  async updateStatusAndUser(id: string, userId: string, status: string) {
    return prisma.file.updateMany({
      where: {
        id,
        userId,
      },
      data: {
        status,
      },
    });
  }
}
