-- ==========================================
-- DENTILENS PRODUCTION DATABASE SCHEMA
-- HIPAA & GDPR COMPLIANT SECURITY STRUCTURE
-- ==========================================

-- Enable UUID generation extension
create extension if not exists "uuid-ossp";

-- 1. DOCTORS / PROFILES TABLE
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    full_name text not null,
    clinic_name text,
    created_at timestamptz default now() not null
);

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create Profile RLS Policies
create policy "Doctors can view their own profile" 
    on public.profiles for select 
    using (auth.uid() = id);

create policy "Doctors can update their own profile" 
    on public.profiles for update 
    using (auth.uid() = id);

-- 2. DENTAL CASES TABLE
create table if not exists public.cases (
    id uuid default gen_random_uuid() primary key,
    doctor_id uuid references public.profiles(id) on delete cascade default auth.uid() not null,
    patient_identifier text not null, -- De-identified HIPAA patient code (e.g. P-8821-NYC)
    type text not null,               -- e.g. Intraoral, Orthodontic, Surgery
    position text,                    -- e.g. Lower Left Molar
    notes text,
    before_image_url text,            -- Supabase Storage link for original scan
    after_image_url text,             -- Supabase Storage link for AI enhanced result
    status text default 'Pending' not null, -- Pending, Processing, Completed
    confidence_score float,           -- AI analysis confidence score (0.0 - 1.0)
    created_at timestamptz default now() not null
);

-- Enable Row Level Security (RLS)
alter table public.cases enable row level security;

-- Create Case RLS Policies (Enforce absolute doctor-data isolation)
create policy "Doctors can view their own cases only" 
    on public.cases for select 
    using (auth.uid() = doctor_id);

create policy "Doctors can create cases" 
    on public.cases for insert 
    with check (auth.uid() = doctor_id);

create policy "Doctors can update their own cases" 
    on public.cases for update 
    using (auth.uid() = doctor_id);

create policy "Doctors can delete their own cases" 
    on public.cases for delete 
    using (auth.uid() = doctor_id);

-- 3. OPTIMIZING INDEXES FOR HIGH-PERFORMANCE SEARCH
create index if not exists idx_cases_doctor_id on public.cases(doctor_id);
create index if not exists idx_cases_status on public.cases(status);
create index if not exists idx_cases_created_at on public.cases(created_at desc);

-- 4. AUTOMATIC PROFILE CREATION TRIGGER (ON USER SIGNUP)
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, full_name, clinic_name)
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', 'Dr. Guest'),
        coalesce(new.raw_user_meta_data->>'clinic_name', 'General Clinic')
    );
    return new;
end;
$$ language plpgsql security definer;

-- Trigger execution link
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- 5. SECURE FILE STORAGE CONFIGURATION
-- Note: Manually create a bucket named 'cases' in the Supabase Storage console,
-- or use these standard policies to secure storage objects:
--
-- Policy for uploads: Only authenticated doctors can upload scans inside their own folder
-- Bucket: 'cases', Allowed Path: 'auth.uid()/*'
--
-- Policy for reads: Only the owner doctor can download scans
