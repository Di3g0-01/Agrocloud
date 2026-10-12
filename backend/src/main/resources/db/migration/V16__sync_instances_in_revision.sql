UPDATE instances
SET status = 'revision'
WHERE id IN (
    SELECT instance_id
    FROM incidents
    WHERE status = 'EN_REVISION'
) AND status = 'active';
