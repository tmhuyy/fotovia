-- Portfolio AI-First Model Cleanup
-- Goal:
-- 1. Stop requiring a manual category for new portfolio items
-- 2. Keep the legacy column only as a backward-compatible fallback
-- 3. Let AI-detected style become the product-facing source of truth

begin;

update profile_portfolio_items
set category = null
where category is not null
  and btrim(category) = '';

alter table profile_portfolio_items
alter column category drop not null;

comment on column profile_portfolio_items.category is
'Legacy manual category field kept temporarily for backward compatibility. AI-detected style is now the source of truth for new portfolio flows.';

commit;