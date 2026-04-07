alter table public.profile_portfolio_items
    add column if not exists classification_status varchar(30) not null default 'not_requested',
    add column if not exists classification_job_id varchar(120),
    add column if not exists classification_requested_at timestamptz,
    add column if not exists classification_started_at timestamptz,
    add column if not exists classification_completed_at timestamptz,
    add column if not exists classification_failed_at timestamptz,
    add column if not exists classification_error text,
    add column if not exists detected_primary_style varchar(100),
    add column if not exists detected_primary_score double precision,
    add column if not exists detected_secondary_styles jsonb,
    add column if not exists detected_style_distribution jsonb;

create table if not exists public.profile_portfolio_item_image_classifications (
    id uuid primary key default gen_random_uuid(),
    portfolio_item_id uuid not null references public.profile_portfolio_items(id) on delete cascade,
    asset_id uuid not null,
    image_key varchar(150) not null,
    role varchar(20) not null,
    status varchar(20) not null,
    predictions_json jsonb,
    top_label varchar(100),
    top_confidence double precision,
    error text,
    classified_at timestamptz,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_profile_portfolio_item_image_classifications_portfolio_item_id
    on public.profile_portfolio_item_image_classifications (portfolio_item_id);

create index if not exists idx_profile_portfolio_item_image_classifications_asset_id
    on public.profile_portfolio_item_image_classifications (asset_id);

create index if not exists idx_profile_portfolio_items_classification_status
    on public.profile_portfolio_items (classification_status);