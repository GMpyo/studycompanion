-- Enable uuid-ossp extension for uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. profiles table
CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    display_name text NOT NULL,
    active_character_id text,
    total_xp integer DEFAULT 0,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
    ON public.profiles FOR SELECT
    USING ( true );

CREATE POLICY "Users can insert their own profile."
    ON public.profiles FOR INSERT
    WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
    ON public.profiles FOR UPDATE
    USING ( auth.uid() = id );

-- 2. cloud_saves table
CREATE TABLE public.cloud_saves (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
    app_data_version integer NOT NULL,
    app_data jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE public.cloud_saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saves."
    ON public.cloud_saves FOR SELECT
    USING ( auth.uid() = user_id );

CREATE POLICY "Users can insert own saves."
    ON public.cloud_saves FOR INSERT
    WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own saves."
    ON public.cloud_saves FOR UPDATE
    USING ( auth.uid() = user_id );

-- 3. friend_requests table
CREATE TABLE public.friend_requests (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    sender_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    status text CHECK (status IN ('pending', 'accepted', 'rejected')) DEFAULT 'pending' NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(sender_id, receiver_id)
);

ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their sent or received requests."
    ON public.friend_requests FOR SELECT
    USING ( auth.uid() = sender_id OR auth.uid() = receiver_id );

CREATE POLICY "Users can send requests."
    ON public.friend_requests FOR INSERT
    WITH CHECK ( auth.uid() = sender_id );

CREATE POLICY "Users can update requests they received."
    ON public.friend_requests FOR UPDATE
    USING ( auth.uid() = receiver_id OR auth.uid() = sender_id );

-- 4. friendships table
-- Enforce user1_id < user2_id to prevent duplicate friendships
CREATE TABLE public.friendships (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user1_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    user2_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CHECK (user1_id < user2_id),
    UNIQUE(user1_id, user2_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their friendships."
    ON public.friendships FOR SELECT
    USING ( auth.uid() = user1_id OR auth.uid() = user2_id );

-- Handled via trigger or secure function normally, but allowing insert if involved
CREATE POLICY "Users can insert friendships if involved."
    ON public.friendships FOR INSERT
    WITH CHECK ( auth.uid() = user1_id OR auth.uid() = user2_id );

CREATE POLICY "Users can delete their friendships."
    ON public.friendships FOR DELETE
    USING ( auth.uid() = user1_id OR auth.uid() = user2_id );

-- 5. weekly_ranking_snapshots table
CREATE TABLE public.weekly_ranking_snapshots (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    week_start_date date NOT NULL,
    weekly_study_minutes integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, week_start_date)
);

ALTER TABLE public.weekly_ranking_snapshots ENABLE ROW LEVEL SECURITY;

-- Friends or self can view rankings (simplified for now, anyone can view)
CREATE POLICY "Rankings are viewable by everyone."
    ON public.weekly_ranking_snapshots FOR SELECT
    USING ( true );

CREATE POLICY "Users can update own ranking."
    ON public.weekly_ranking_snapshots FOR INSERT
    WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can update own ranking."
    ON public.weekly_ranking_snapshots FOR UPDATE
    USING ( auth.uid() = user_id );
