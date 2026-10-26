-- Only needed if setup.sql was already run before the optional-field update.
begin;
alter table public.teacher_submissions
  drop constraint if exists teacher_submissions_ministry_number_check;
alter table public.teacher_submissions
  add constraint teacher_submissions_ministry_number_check
  check (ministry_number = '' or ministry_number ~ '^[0-9]{1,20}$');
commit;
