CREATE TABLE payments (
    id UUID PRIMARY KEY,
    subscription_id UUID NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('COMPLETED', 'PENDING', 'FAILED', 'REJECTED')),
    reference VARCHAR(100) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'TARJETA',
    concept VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_payments_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions (id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_subscription ON payments (subscription_id);

CREATE TABLE invoices (
    id UUID PRIMARY KEY,
    payment_id UUID NOT NULL UNIQUE,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    issue_date TIMESTAMP WITH TIME ZONE NOT NULL,
    subtotal NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    concept VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_invoices_payment FOREIGN KEY (payment_id) REFERENCES payments (id) ON DELETE CASCADE
);

CREATE INDEX idx_invoices_payment ON invoices (payment_id);
