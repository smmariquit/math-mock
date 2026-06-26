-- Run once in Supabase SQL editor, or: supabase db query -f supabase/setup.sql --linked

create table if not exists exam_sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  student_name text not null default 'Student',
  email text not null,
  exam_id text not null default 'standard'
    check (exam_id in ('standard', 'advanced')),
  status text not null default 'in_progress'
    check (status in ('in_progress', 'completed', 'expired')),
  seed bigint not null,
  time_limit_seconds int not null default 10800,
  time_remaining_seconds int not null,
  started_at timestamptz not null default now(),
  current_index int not null default 0,
  answers jsonb not null default '{}'::jsonb,
  flagged int[] not null default '{}',
  score int,
  correct_count int,
  topic_breakdown jsonb
);

create index if not exists exam_sessions_updated_at_idx on exam_sessions (updated_at desc);
create index if not exists exam_sessions_email_exam_status_idx
  on exam_sessions (email, exam_id, status, updated_at desc);

alter table exam_sessions enable row level security;

drop policy if exists "Allow anonymous read/write exam sessions" on exam_sessions;
create policy "Allow anonymous read/write exam sessions"
  on exam_sessions
  for all
  using (true)
  with check (true);
