CREATE TABLE service_plans (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    storage_gb DOUBLE PRECISION NOT NULL,
    monthly_price NUMERIC(10, 2) NOT NULL,
    description TEXT,
    max_instances INTEGER NOT NULL,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE subscriptions (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    plan_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('pending_payment', 'active', 'suspended', 'cancelled')),
    start_date DATE NOT NULL,
    next_billing_date DATE,
    amount NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_subscriptions_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES service_plans (id)
);

CREATE INDEX idx_subscriptions_user_status ON subscriptions (user_id, status);

CREATE TABLE instances (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    template VARCHAR(100),
    version VARCHAR(50) NOT NULL DEFAULT 'PostgreSQL 16.2',
    status VARCHAR(20) NOT NULL CHECK (status IN ('active', 'revision', 'suspended', 'terminated')),
    region VARCHAR(100) NOT NULL DEFAULT 'us-east-1 (Virginia)',
    host VARCHAR(150) NOT NULL,
    port INTEGER NOT NULL DEFAULT 5432,
    database_name VARCHAR(100) NOT NULL,
    db_user VARCHAR(100) NOT NULL,
    encrypted_password VARCHAR(255) NOT NULL,
    used_storage_gb DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    total_storage_gb DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    cpu_usage_percentage DOUBLE PRECISION NOT NULL DEFAULT 15.0,
    memory_usage_percentage DOUBLE PRECISION NOT NULL DEFAULT 30.0,
    uptime VARCHAR(20) NOT NULL DEFAULT '99.9%',
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_instances_owner FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_instances_owner ON instances (owner_id);
CREATE INDEX idx_instances_status ON instances (status);
