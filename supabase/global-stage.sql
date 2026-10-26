-- Add the new stage without rewriting or deleting historical records.
begin;
alter table public.teacher_submissions drop constraint if exists teacher_submissions_stage_check;
alter table public.teacher_submissions add constraint teacher_submissions_stage_check
 check (stage in ('عالمي','رياض أطفال','ابتدائي','متوسط','ثانوي'));
-- Also apply the previously requested optional ministry number.
alter table public.teacher_submissions drop constraint if exists teacher_submissions_ministry_number_check;
alter table public.teacher_submissions add constraint teacher_submissions_ministry_number_check
 check (ministry_number = '' or ministry_number ~ '^[0-9]{1,20}$');
commit;
