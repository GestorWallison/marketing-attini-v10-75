-- Fix security vulnerability: Restrict campaign SELECT policy to user's own campaigns
DROP POLICY IF EXISTS "Users can view campaigns" ON public.campaigns;

-- Create new restrictive policy that only allows users to view their own campaigns
CREATE POLICY "Users can view their own campaigns" 
ON public.campaigns 
FOR SELECT 
USING (auth.uid() = user_id);