ALTER TABLE subscriptions
    ADD COLUMN IF NOT EXISTS addons VARCHAR(500),
    ADD COLUMN IF NOT EXISTS max_instances INTEGER,
    ADD COLUMN IF NOT EXISTS storage_gb DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS pending_payment_amount NUMERIC(10, 2),
    ADD COLUMN IF NOT EXISTS payment_concept VARCHAR(255);

-- Inicializar límites para suscripciones existentes a partir del plan base
UPDATE subscriptions s
SET max_instances = sp.max_instances,
    storage_gb = sp.storage_gb
FROM service_plans sp
WHERE s.plan_id = sp.id AND s.max_instances IS NULL;

