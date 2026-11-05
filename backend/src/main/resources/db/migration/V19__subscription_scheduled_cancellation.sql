ALTER TABLE subscriptions
    ADD COLUMN cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN cancellation_date DATE;

CREATE INDEX idx_subscriptions_scheduled_cancellation
    ON subscriptions (status, cancel_at_period_end, cancellation_date);
