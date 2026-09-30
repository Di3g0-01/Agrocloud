CREATE TABLE roles (
    code VARCHAR(20) PRIMARY KEY,
    CONSTRAINT ck_roles_code CHECK (code IN ('ADMINISTRADOR', 'CLIENTE', 'SOPORTE'))
);

INSERT INTO roles (code) VALUES ('ADMINISTRADOR'), ('CLIENTE'), ('SOPORTE');

ALTER TABLE users ADD COLUMN role_code VARCHAR(20);
UPDATE users SET role_code = role;
ALTER TABLE users ALTER COLUMN role_code SET NOT NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_role
    FOREIGN KEY (role_code) REFERENCES roles (code);

DROP INDEX idx_users_role;
ALTER TABLE users DROP CONSTRAINT ck_users_role;
ALTER TABLE users DROP COLUMN role;
CREATE INDEX idx_users_role_code ON users (role_code);
