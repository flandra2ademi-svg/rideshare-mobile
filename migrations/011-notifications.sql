-- Java 11: personal in-app notifications for ride-request responses.
-- Run after migrations/010-live-ride-requests.sql.
-- Existing accepted requests are intentionally not backfilled.
BEGIN;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'kerkesa_id_udhetari_key'
  ) THEN
    ALTER TABLE kerkesa_udhetimeve
      ADD CONSTRAINT kerkesa_id_udhetari_key UNIQUE (id, udhetari_id);
  END IF;
END;
$$;

CREATE TABLE IF NOT EXISTS njoftimet (
  id BIGSERIAL PRIMARY KEY,
  perdoruesi_id TEXT NOT NULL REFERENCES profilet(id) ON DELETE CASCADE,
  kerkesa_id BIGINT NOT NULL REFERENCES kerkesa_udhetimeve(id) ON DELETE CASCADE,
  lloji TEXT NOT NULL CHECK (lloji IN ('accepted')),
  krijuar_me TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lexuar_me TIMESTAMPTZ,
  CONSTRAINT njoftim_kerkesa_lloj_unique UNIQUE (kerkesa_id, lloji),
  CONSTRAINT njoftim_kerkesa_marrese_fk
    FOREIGN KEY (kerkesa_id, perdoruesi_id)
    REFERENCES kerkesa_udhetimeve (id, udhetari_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS njoftimet_perdoruesi_lexuar_idx
  ON njoftimet (perdoruesi_id, lexuar_me, krijuar_me DESC);

-- The referenced request is the source of truth for the recipient. The
-- function never accepts a recipient from the browser.
CREATE OR REPLACE FUNCTION prano_kerkese(
  p_kerkesa_id BIGINT,
  p_shofer_id TEXT
) RETURNS TABLE (kerkesa_id BIGINT, udhetimi_id TEXT, vende INTEGER, status TEXT)
LANGUAGE plpgsql
AS $$
DECLARE
  k kerkesa_udhetimeve%ROWTYPE;
  u udhetimet%ROWTYPE;
BEGIN
  SELECT * INTO k
  FROM kerkesa_udhetimeve
  WHERE id = p_kerkesa_id
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'KERKESA_NUK_EKZISTON' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO u
  FROM udhetimet
  WHERE id = k.udhetimi_id
  FOR UPDATE;
  IF u.shofer_id IS DISTINCT FROM p_shofer_id THEN
    RAISE EXCEPTION 'NUK_JE_PRONAR' USING ERRCODE = 'P0001';
  END IF;
  IF k.status = 'accepted' THEN
    RETURN QUERY SELECT k.id, u.id, u.vende, k.status;
    RETURN;
  END IF;
  IF u.vende <= 0 THEN
    RAISE EXCEPTION 'NUK_KA_VENDE' USING ERRCODE = 'P0001';
  END IF;

  UPDATE kerkesa_udhetimeve AS k_update
  SET status = 'accepted', pranuar_me = NOW()
  WHERE k_update.id = k.id;

  UPDATE udhetimet AS ud
  SET vende = ud.vende - 1
  WHERE ud.id = u.id;

  INSERT INTO njoftimet (perdoruesi_id, kerkesa_id, lloji)
  VALUES (k.udhetari_id, k.id, 'accepted')
  ON CONFLICT (kerkesa_id, lloji) DO NOTHING;

  RETURN QUERY SELECT k.id, u.id, u.vende - 1, 'accepted'::TEXT;
END;
$$;

COMMIT;
