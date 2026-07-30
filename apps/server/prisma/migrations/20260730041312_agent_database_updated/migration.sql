/*
  Warnings:

  - Added the required column `success` to the `ToolExecution` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ToolExecution" ADD COLUMN     "success" BOOLEAN NOT NULL;
