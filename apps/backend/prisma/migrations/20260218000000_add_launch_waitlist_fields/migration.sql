-- AlterTable
ALTER TABLE "users" ADD COLUMN "launch_access_granted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "waitlist_position" INTEGER;
ALTER TABLE "users" ADD COLUMN "launch_email_sent" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "users_launch_access_granted_idx" ON "users"("launch_access_granted");
