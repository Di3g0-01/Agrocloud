-- Existing and administratively provisioned accounts retain access. Public
-- registration explicitly creates an unverified, pending account.
ALTER TABLE users
    ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT TRUE,
    ADD COLUMN auth_version BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN verification_token_hash VARCHAR(64),
    ADD COLUMN verification_expires_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN verification_sent_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN reset_token_hash VARCHAR(64),
    ADD COLUMN reset_expires_at TIMESTAMP WITH TIME ZONE,
    ADD COLUMN reset_sent_at TIMESTAMP WITH TIME ZONE;

CREATE UNIQUE INDEX uk_users_verification_token ON users (verification_token_hash);
CREATE UNIQUE INDEX uk_users_reset_token ON users (reset_token_hash);
