-- Adds the recipe headnote/intro used for UX + SEO (meta description, JSON-LD, OG tags).
-- Run once in the Supabase SQL editor (or via your DB console).
-- Safe to re-run: guarded with IF NOT EXISTS.

ALTER TABLE public.recipes
  ADD COLUMN IF NOT EXISTS description text;

COMMENT ON COLUMN public.recipes.description IS
  'Appetizing 2-4 sentence intro/headnote for the recipe. Always English (for SEO). Surfaced on the page, in <meta name="description">, Open Graph, and schema.org/Recipe JSON-LD.';
