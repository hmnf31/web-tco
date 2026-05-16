-- TCO Esports Database Schema
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS tco_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT now(),
  full_name TEXT NOT NULL,
  whatsapp_number TEXT NOT NULL,
  game_username TEXT NOT NULL,
  division TEXT NOT NULL CHECK (division IN ('Chess', 'MLBB', 'Both')),
  payment_info TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'Pending'
);

-- Enable Row Level Security
ALTER TABLE tco_members ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for registration form)
CREATE POLICY "Allow anonymous insert" ON tco_members
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow authenticated select (for admin dashboard)
CREATE POLICY "Allow authenticated select" ON tco_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Create an index on status for faster admin queries
CREATE INDEX idx_tco_members_status ON tco_members(status);
CREATE INDEX idx_tco_members_division ON tco_members(division);
