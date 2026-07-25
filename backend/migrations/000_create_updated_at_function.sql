-- Shared trigger function: keeps `updated_at` current on every UPDATE.
-- Attached to individual tables in their own migrations (001, 002, ...).
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
