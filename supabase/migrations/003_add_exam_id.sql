-- Add exam_id to distinguish Mock Exam 1 vs Mock Exam 2 sessions

alter table exam_sessions
  add column if not exists exam_id text not null default 'standard'
  check (exam_id in ('standard', 'advanced'));

create index if not exists exam_sessions_email_exam_status_idx
  on exam_sessions (email, exam_id, status, updated_at desc);
