create table profiles (
  id uuid primary key references auth.users on delete cascade,
  role text check (role in ('student', 'parent', 'coach')),
  full_name text,
  email text,
  status text check (status in ('pending', 'active', 'expired')),
  created_at timestamp with time zone default now()
);

create table students (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles on delete cascade,
  high_school text,
  city text,
  state text,
  grade text,
  gpa decimal,
  parent_email text,
  created_at timestamp with time zone default now()
);

create table parents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles on delete cascade,
  student_id uuid references students on delete set null,
  relationship text,
  created_at timestamp with time zone default now()
);

create table coaches (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles on delete cascade,
  university text,
  division text,
  state text,
  verified boolean default false,
  created_at timestamp with time zone default now()
);

create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references parents on delete cascade,
  student_id uuid references students on delete set null,
  plan text check (plan in ('silver', 'gold')),
  billing_frequency text check (billing_frequency in ('monthly', '6months', 'annual')),
  stripe_id text,
  status text check (status in ('active', 'canceled', 'past_due')),
  created_at timestamp with time zone default now()
);

alter table profiles enable row level security;
alter table students enable row level security;
alter table parents enable row level security;
alter table coaches enable row level security;
alter table subscriptions enable row level security;
