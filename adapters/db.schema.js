/**
 * PostgreSQL Schema Migration Draft
 * Represents how the MongoDB/NoSQL frontend structures map to strict relational databases.
 */

App.Adapters.DB_Schema = `
-- === USERS TABLE ===
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "role" VARCHAR(20) NOT NULL CHECK ("role" IN ('CUSTOMER', 'CRAFTSMAN', 'PARTNER')),
    "full_name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) UNIQUE,
    "district_id" INT REFERENCES "districts"("id"),
    "referral_code" VARCHAR(20) UNIQUE,
    "trust_score" INT DEFAULT 100,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === WALLETS TABLE ===
CREATE TABLE "wallets" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
    "balance" DECIMAL(10,2) DEFAULT 0.00,
    "pending_balance" DECIMAL(10,2) DEFAULT 0.00,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- === SERVICES TABLE ===
CREATE TABLE "services" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "customer_id" UUID REFERENCES "users"("id"),
    "craftsman_id" UUID REFERENCES "users"("id"),
    "status" VARCHAR(20) NOT NULL DEFAULT 'CREATED',
    "agreed_price" DECIMAL(10,2),
    "credit_used" DECIMAL(10,2) DEFAULT 0.00,
    "is_secure" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP
);

-- === REFERRAL_LEDGER ===
CREATE TABLE "referral_ledger" (
    "id" UUID PRIMARY KEY,
    "referrer_id" UUID REFERENCES "users"("id"),
    "invited_user_id" UUID REFERENCES "users"("id"),
    "status" VARCHAR(20) DEFAULT 'PENDING',
    "reward_amount" DECIMAL(10,2) DEFAULT 750.00
);
`;
