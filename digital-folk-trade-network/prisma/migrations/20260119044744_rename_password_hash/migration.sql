-- Preserve existing passwords by renaming the column instead of dropping data
ALTER TABLE "User" RENAME COLUMN "password" TO "passwordHash";
