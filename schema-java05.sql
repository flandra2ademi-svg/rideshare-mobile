-- Java 5: ruan skemën ekzistuese ku shofer_id referon profilet.id.
-- Ekzekutohet pas schema.sql; nuk ndryshon orët ose pronarët ekzistues.
BEGIN;
CREATE TABLE IF NOT EXISTS profilet (
  id TEXT PRIMARY KEY,
  github_id TEXT NOT NULL UNIQUE,
  emri TEXT NOT NULL,
  roli TEXT NOT NULL DEFAULT 'udhetar' CHECK (roli IN ('udhetar', 'shofer'))
);
ALTER TABLE profilet ADD COLUMN IF NOT EXISTS roli TEXT NOT NULL
  DEFAULT 'udhetar' CHECK (roli IN ('udhetar', 'shofer'));
ALTER TABLE udhetimet ADD COLUMN IF NOT EXISTS shofer_id TEXT REFERENCES profilet(id);
INSERT INTO profilet (id, github_id, emri, roli)
VALUES ('DEMO-SHOFER-2', 'DEMO-SHOFER-2', 'Shoferi tjetër (demo)', 'shofer')
ON CONFLICT (github_id) DO NOTHING;
UPDATE udhetimet SET shofer_id = (
  SELECT id FROM profilet WHERE github_id = 'DEMO-SHOFER-2'
) WHERE id = '1' AND shofer_id IS NULL;
COMMIT;

-- Vetëm administratori i laboratorit, pasi kontrollon ID-në nga paneli:
-- UPDATE profilet SET roli = 'shofer' WHERE github_id = 'ID_NGA_PANELI';
-- UPDATE udhetimet SET shofer_id = (
--   SELECT id FROM profilet WHERE github_id = 'ID_NGA_PANELI'
-- ) WHERE id = '2';
-- SELECT u.id, u.ora, u.shofer_id, p.roli FROM udhetimet u
-- LEFT JOIN profilet p ON p.id = u.shofer_id ORDER BY u.id;
