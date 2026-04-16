-- Drop the old foreign key from projects to the Prisma User table
ALTER TABLE "Project" DROP CONSTRAINT "Project_userId_fkey";

-- Drop the old user table since Clerk is now the source of truth for identity
DROP TABLE "User";

-- Keep user-scoped project queries fast
CREATE INDEX "Project_userId_idx" ON "Project"("userId");
