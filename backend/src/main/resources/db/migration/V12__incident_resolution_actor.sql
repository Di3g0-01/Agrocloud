ALTER TABLE incidents
    ADD COLUMN resolved_by_id UUID REFERENCES users(id),
    ADD COLUMN resolved_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX idx_incidents_resolved_by_date ON incidents(resolved_by_id, resolved_at DESC);
