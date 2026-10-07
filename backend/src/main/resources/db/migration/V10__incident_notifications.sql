CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(40) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    resource_id UUID,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_notifications_recipient_date ON notifications(recipient_id, created_at DESC);
