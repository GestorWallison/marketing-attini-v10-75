-- Create storage bucket for campaign cover images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('campaign-covers', 'campaign-covers', true);

-- Create policies for campaign cover uploads
CREATE POLICY "Users can view campaign covers" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-covers');

CREATE POLICY "Authenticated users can upload campaign covers" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'campaign-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own campaign covers" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'campaign-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own campaign covers" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'campaign-covers' AND auth.role() = 'authenticated');