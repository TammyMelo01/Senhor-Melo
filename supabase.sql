create table if not exists families (id uuid primary key default gen_random_uuid(), name text not null);
