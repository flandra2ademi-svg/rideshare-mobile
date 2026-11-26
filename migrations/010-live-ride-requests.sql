-- Java 10: persistent ride requests and atomic driver acceptance.
-- Run after schema-java05.sql and migrations/009-favorites.sql.
BEGIN;

CREATE TABLE IF NOT EXISTS kerkesa_udhetimeve (
  id BIGSERIAL PRIMARY KEY,
  udhetimi_id TEXT NOT NULL REFERENCES udhetimet(id) ON DELETE CASCADE,
  udhetari_id TEXT NOT NULL REFERENCES profilet(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  krijuar_me TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pranuar_me TIMESTAMPTZ,
  CONSTRAINT kerkesa_udhetimi_udhetari_unique UNIQUE (udhetimi_id, udhetari_id),
  CONSTRAINT kerkesa_pranuar_me_consistency CHECK (
    (status = 'pending' AND pranuar_me IS NULL) OR
    (status = 'accepted' AND pranuar_me IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS kerkesa_udhetimeve_udhetimi_status_idx
  ON kerkesa_udhetimeve (udhetimi_id, status);

-- The function is the transaction boundary: both row locks and both updates
-- are committed together, or PostgreSQL rolls the statement back together.
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
  SELECT * INTO k FROM kerkesa_udhetimeve WHERE id = p_kerkesa_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'KERKESA_NUK_EKZISTON' USING ERRCODE = 'P0001'; END IF;

  SELECT * INTO u FROM udhetimet WHERE id = k.udhetimi_id FOR UPDATE;
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

  UPDATE kerkesa_udhetimeve
  SET status = 'accepted', pranuar_me = NOW()
  WHERE id = k.id;
  -- Qualify both sides: RETURNS TABLE exposes a PL/pgSQL variable named
  -- `vende`, so an unqualified `vende = vende - 1` is ambiguous.
  UPDATE udhetimet AS ud
  SET vende = ud.vende - 1
  WHERE ud.id = u.id;

  RETURN QUERY SELECT k.id, u.id, u.vende - 1, 'accepted'::TEXT;
END;
$$;

COMMIT;
