-- Java 9: favorites for authenticated passengers.
-- Run after schema-java05.sql. The existing identity and ride keys are TEXT.
BEGIN;

CREATE TABLE IF NOT EXISTS preferencat_udhetimeve (
  id BIGSERIAL PRIMARY KEY,
  perdoruesi_id TEXT NOT NULL REFERENCES profilet(id) ON DELETE CASCADE,
  udhetimi_id TEXT NOT NULL REFERENCES udhetimet(id) ON DELETE CASCADE,
  krijuar_me TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT preferencat_udhetimeve_perdorues_udhetim_unique
    UNIQUE (perdoruesi_id, udhetimi_id)
);

CREATE INDEX IF NOT EXISTS preferencat_udhetimeve_udhetimi_idx
  ON preferencat_udhetimeve (udhetimi_id);

COMMIT;
