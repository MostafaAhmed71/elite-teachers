-- Run once in this project's SQL Editor. It never deletes existing records.
-- This dedicated schema has no privileged SECURITY DEFINER functions.
begin;
create table if not exists public.teacher_submissions (
 id uuid primary key default gen_random_uuid(),
 created_at timestamptz not null default now(),
 education_department text not null check (length(trim(education_department)) between 1 and 200),
 school_name text not null check (length(trim(school_name)) between 1 and 200),
 ministry_number text not null check (ministry_number = '' or ministry_number ~ '^[0-9]{1,20}$'),
 stage text not null check (stage in ('رياض أطفال','ابتدائي','متوسط','ثانوي')),
 full_name text not null check (length(trim(full_name)) between 5 and 200),
 gender text not null check (gender in ('ذكر','أنثى')),
 nationality text not null check (length(trim(nationality)) between 1 and 200),
 qualification text not null check (length(trim(qualification)) between 1 and 200),
 specialization text not null check (length(trim(specialization)) between 1 and 200),
 mobile text not null check (mobile ~ '^(05[0-9]{8}|(\+|00)[1-9][0-9]{7,14})$'),
 email text not null check (length(email)<=200 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
 job_title text not null check (length(trim(job_title)) between 1 and 200),
 national_id text not null unique check (national_id ~ '^[0-9]{10}$'),
 teacher_rank text not null check (teacher_rank in ('مساعد معلم','معلم ممارس','معلم متقدم','معلم خبير','لا يوجد')),
 general_score numeric check (general_score between 0 and 100),
 specialist_score numeric check (specialist_score between 0 and 100)
);
create table if not exists public.teacher_form_admins (
 user_id uuid primary key references auth.users(id) on delete cascade
);
-- Re-running setup also upgrades an existing required ministry-number constraint.
alter table public.teacher_submissions drop constraint if exists teacher_submissions_ministry_number_check;
alter table public.teacher_submissions add constraint teacher_submissions_ministry_number_check
 check (ministry_number = '' or ministry_number ~ '^[0-9]{1,20}$');
alter table public.teacher_submissions enable row level security;
alter table public.teacher_form_admins enable row level security;
revoke all on public.teacher_submissions from anon,authenticated;
revoke all on public.teacher_form_admins from anon,authenticated;
grant usage on schema public to anon,authenticated;
-- Respondents may supply only the 16 input columns, not IDs/timestamps.
grant insert (education_department,school_name,ministry_number,stage,full_name,gender,nationality,qualification,specialization,mobile,email,job_title,national_id,teacher_rank,general_score,specialist_score) on public.teacher_submissions to anon,authenticated;
grant select on public.teacher_submissions to authenticated;
grant select on public.teacher_form_admins to authenticated;
drop policy if exists teacher_form_submit on public.teacher_submissions;
create policy teacher_form_submit on public.teacher_submissions for insert to anon,authenticated with check (created_at=now());
drop policy if exists teacher_form_admin_self on public.teacher_form_admins;
create policy teacher_form_admin_self on public.teacher_form_admins for select to authenticated using (user_id=(select auth.uid()));
drop policy if exists teacher_form_admin_read on public.teacher_submissions;
create policy teacher_form_admin_read on public.teacher_submissions for select to authenticated using (exists(select 1 from public.teacher_form_admins a where a.user_id=(select auth.uid())));
create index if not exists teacher_submissions_created_at_idx on public.teacher_submissions(created_at desc,id desc);
commit;
-- After creating your admin in Authentication > Users > Add user,
-- execute the following separately using the SAME email as that user.
-- Replace the email if you want a different administrator.
insert into public.teacher_form_admins(user_id)
select id from auth.users where lower(email)='moahmed7412@gmail.com'
on conflict(user_id) do nothing;
-- This must return at least one row after creating the administrator.
select a.user_id,u.email from public.teacher_form_admins a join auth.users u on u.id=a.user_id;
