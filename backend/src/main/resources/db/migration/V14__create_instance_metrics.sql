CREATE TABLE IF NOT EXISTS instance_metrics (
    id UUID PRIMARY KEY,
    instance_id UUID NOT NULL,
    used_storage_gb DOUBLE PRECISION NOT NULL,
    total_storage_gb DOUBLE PRECISION NOT NULL,
    cpu_usage_percentage DOUBLE PRECISION NOT NULL,
    memory_usage_percentage DOUBLE PRECISION NOT NULL,
    status VARCHAR(20) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_instance_metrics_instance FOREIGN KEY (instance_id) REFERENCES instances (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_instance_metrics_instance_time ON instance_metrics (instance_id, recorded_at DESC);
