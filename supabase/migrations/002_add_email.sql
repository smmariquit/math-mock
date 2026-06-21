-- Add email for cross-device progress restore.

alter table exam_sessions
  add column if not exists email text;

update exam_sessions set email = lower(trim(student_name)) || '@local.invalid'
  where email is null;

alter table exam_sessions alter column email set not null;

create index if not exists exam_sessions_email_status_idx
  on exam_sessions (email, status, updated_at desc);
