-- AlterTable
ALTER TABLE `ExamQuestion` ADD COLUMN `lessonId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `QuizQuestion` ADD COLUMN `lessonId` VARCHAR(191) NULL;
