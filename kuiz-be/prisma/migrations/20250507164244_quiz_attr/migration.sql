/*
  Warnings:

  - The `options` column on the `Question` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Made the column `answer` on table `Question` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Question" DROP COLUMN "options",
ADD COLUMN     "options" TEXT[],
ALTER COLUMN "answer" SET NOT NULL;
