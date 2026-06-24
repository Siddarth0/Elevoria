-- AlterTable: password is now optional (Google-authenticated users have none)
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable: add Google account id
ALTER TABLE "User" ADD COLUMN "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");
