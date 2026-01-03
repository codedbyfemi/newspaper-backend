-- AlterTable
ALTER TABLE "community_members" ADD COLUMN     "deleted_by" TEXT;

-- CreateTable
CREATE TABLE "community_otps" (
    "id" TEXT NOT NULL,
    "community_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "otp" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "community_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "community_otps_community_id_email_action_idx" ON "community_otps"("community_id", "email", "action");
