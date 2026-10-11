CREATE TABLE incidents (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    instance_id UUID NOT NULL REFERENCES instances(id) ON DELETE CASCADE,
    subject VARCHAR(200) NOT NULL,
    category VARCHAR(80) NOT NULL,
    problem TEXT NOT NULL,
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('ALTA', 'MEDIA', 'BAJA')),
    status VARCHAR(20) NOT NULL CHECK (status IN ('ABIERTA', 'EN_REVISION', 'RESUELTA')),
    diagnostic_guide TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL
);
CREATE INDEX idx_incidents_owner ON incidents(owner_id);
CREATE INDEX idx_incidents_instance ON incidents(instance_id);
