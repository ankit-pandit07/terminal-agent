import { prisma } from "../../db/prisma.js";

export class ToolExecutionRepository {
  async create(
    executionId: string,
    tool: string,
    input: string,
    output: string,
    success: boolean,
  ) {
    return prisma.toolExecution.create({
      data: {
        executionId,
        tool,
        input,
        output,
        success,
      },
    });
  }

  async findFailed() {
    return prisma.toolExecution.findMany({
      where: {
        success: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async deleteByExecution(executionId: string) {
    return prisma.toolExecution.deleteMany({
      where: {
        executionId,
      },
    });
  }
}
