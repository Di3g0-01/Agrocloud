CREATE TABLE users (
    id UUID PRIMARY KEY,
    organization_name VARCHAR(150) NOT NULL,
    contact_name VARCHAR(150),
    email VARCHAR(254) NOT NULL,
    phone VARCHAR(30),
    password_hash VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_users_email UNIQUE (email),
    CONSTRAINT ck_users_role CHECK (role IN ('ADMINISTRADOR', 'CLIENTE', 'SOPORTE')),
    CONSTRAINT ck_users_status CHECK (status IN ('ACTIVO', 'PENDIENTE', 'SUSPENDIDO'))
);

CREATE INDEX idx_users_role ON users (role);
CREATE INDEX idx_users_status ON users (status);
