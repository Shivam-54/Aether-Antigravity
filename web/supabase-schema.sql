-- Supabase Database Schema for Aether Isle Access System
-- Run this in the Supabase SQL Editor after creating your project

-- Create the access_requests table
CREATE TABLE IF NOT EXISTS access_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    age INTEGER NOT NULL CHECK (age >= 18 AND age <= 120),
    country_code TEXT NOT NULL,
    contact_number TEXT NOT NULL,
    auth_key_type TEXT NOT NULL,
    auth_key_hash TEXT NOT NULL, -- Will store hashed authentication keys
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewer_notes TEXT
);

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_access_requests_email ON access_requests(email);

-- Add index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);

-- Enable Row Level Security
ALTER TABLE access_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert new access requests
CREATE POLICY IF NOT EXISTS "Allow public insert" 
ON access_requests 
FOR INSERT
TO public
WITH CHECK (true);

-- Policy: Users can read their own requests
CREATE POLICY IF NOT EXISTS "Users can read own requests" 
ON access_requests 
FOR SELECT
USING (auth.jwt() ->> 'email' = email);

-- Policy: Only authenticated admins can update status
-- (You'll need to set up admin role separately)
CREATE POLICY IF NOT EXISTS "Admins can update requests" 
ON access_requests 
FOR UPDATE
TO authenticated
USING (auth.jwt() ->> 'role' = 'admin');

-- Create a function to automatically update reviewed_at timestamp
CREATE OR REPLACE FUNCTION update_reviewed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status AND NEW.status IN ('approved', 'rejected') THEN
        NEW.reviewed_at = TIMEZONE('utc', NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update reviewed_at
CREATE TRIGGER IF NOT EXISTS set_reviewed_at
    BEFORE UPDATE ON access_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_reviewed_at();

-- NOTE: Supabase Auth handles the users table automatically
-- When you approve an access request, manually create the user via Supabase dashboard
