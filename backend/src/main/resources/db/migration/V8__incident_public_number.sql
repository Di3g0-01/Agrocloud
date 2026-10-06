CREATE SEQUENCE incident_ticket_number_seq START WITH 1;

ALTER TABLE incidents ADD COLUMN ticket_number BIGINT;

WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at, id) AS number
    FROM incidents
)
UPDATE incidents AS incident
SET ticket_number = numbered.number
FROM numbered
WHERE incident.id = numbered.id;

SELECT setval('incident_ticket_number_seq',
              COALESCE(MAX(ticket_number), 1),
              COUNT(*) > 0)
FROM incidents;

ALTER TABLE incidents
    ALTER COLUMN ticket_number SET DEFAULT nextval('incident_ticket_number_seq'),
    ALTER COLUMN ticket_number SET NOT NULL,
    ADD CONSTRAINT incidents_ticket_number_unique UNIQUE (ticket_number);

ALTER SEQUENCE incident_ticket_number_seq OWNED BY incidents.ticket_number;
