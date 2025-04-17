-- Your SQL goes here
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles NOT NULL,
  permission_id UUID REFERENCES permissions NOT NULL,
  PRIMARY KEY (role_id, permission_id)
);

INSERT INTO
  role_permissions (role_id, permission_id)
SELECT
  (
    SELECT
      id
    FROM
      roles
    WHERE
      name = 'admin'
  ),
  id
FROM
  permissions;

INSERT INTO
  role_permissions (role_id, permission_id)
SELECT
  (
    SELECT
      id
    FROM
      roles
    WHERE
      name = 'user'
  ),
  id
FROM
  permissions
WHERE
  name IN (
    'product:create',
    'product:read',
    'user:read',
    'shop:create',
    'shop:read'
  );
