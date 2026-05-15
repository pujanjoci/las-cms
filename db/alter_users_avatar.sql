-- Add avatar_url column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create avatars storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for avatars bucket
-- Allow public access to view avatars
CREATE POLICY "Avatar images are publicly accessible." 
ON storage.objects FOR SELECT 
USING (bucket_id = 'user-avatars');

-- Allow authenticated users to upload avatars
CREATE POLICY "Anyone can upload an avatar." 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');

-- Allow users to update their own avatars
CREATE POLICY "Anyone can update their own avatar." 
ON storage.objects FOR UPDATE 
WITH CHECK (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');
