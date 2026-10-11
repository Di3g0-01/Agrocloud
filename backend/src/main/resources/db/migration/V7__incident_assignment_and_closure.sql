ALTER TABLE incidents
    ADD COLUMN assigned_support_id UUID REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE incidents DROP CONSTRAINT incidents_status_check;
ALTER TABLE incidents ADD CONSTRAINT incidents_status_check
    CHECK (status IN ('ABIERTA', 'EN_REVISION', 'RESUELTA', 'CERRADA'));

CREATE INDEX idx_incidents_assigned_support ON incidents(assigned_support_id);
