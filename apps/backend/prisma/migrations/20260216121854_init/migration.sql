-- CreateEnum
CREATE TYPE "PlanStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Interval" AS ENUM ('DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "starknet_address" TEXT NOT NULL,
    "nonce" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dca_plans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "deposit_token_address" TEXT NOT NULL,
    "target_token_address" TEXT NOT NULL,
    "amount_per_execution" TEXT NOT NULL,
    "total_deposited" TEXT NOT NULL,
    "total_executions" INTEGER NOT NULL,
    "executions_completed" INTEGER NOT NULL DEFAULT 0,
    "interval" "Interval" NOT NULL,
    "next_execution_at" TIMESTAMP(3) NOT NULL,
    "status" "PlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "on_chain_plan_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dca_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "execution_history" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "execution_number" INTEGER NOT NULL,
    "amount_in" TEXT NOT NULL,
    "amount_out" TEXT,
    "price_at_execution" DOUBLE PRECISION,
    "tx_hash" TEXT,
    "status" "ExecutionStatus" NOT NULL DEFAULT 'PENDING',
    "error_message" TEXT,
    "executed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "execution_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_starknet_address_key" ON "users"("starknet_address");

-- CreateIndex
CREATE INDEX "users_starknet_address_idx" ON "users"("starknet_address");

-- CreateIndex
CREATE INDEX "dca_plans_user_id_idx" ON "dca_plans"("user_id");

-- CreateIndex
CREATE INDEX "dca_plans_status_next_execution_at_idx" ON "dca_plans"("status", "next_execution_at");

-- CreateIndex
CREATE INDEX "dca_plans_on_chain_plan_id_idx" ON "dca_plans"("on_chain_plan_id");

-- CreateIndex
CREATE INDEX "execution_history_plan_id_idx" ON "execution_history"("plan_id");

-- CreateIndex
CREATE INDEX "execution_history_status_idx" ON "execution_history"("status");

-- CreateIndex
CREATE INDEX "execution_history_executed_at_idx" ON "execution_history"("executed_at");

-- CreateIndex
CREATE UNIQUE INDEX "execution_history_plan_id_execution_number_key" ON "execution_history"("plan_id", "execution_number");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_idx" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- AddForeignKey
ALTER TABLE "dca_plans" ADD CONSTRAINT "dca_plans_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution_history" ADD CONSTRAINT "execution_history_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "dca_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
