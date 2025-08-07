-- Criar buckets de storage para arquivos
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('campaign-files', 'campaign-files', false),
  ('graphic-pieces', 'graphic-pieces', true);

-- Políticas de storage para campaign-files (arquivos privados)
CREATE POLICY "Users can view their own campaign files" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'campaign-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own campaign files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'campaign-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own campaign files" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'campaign-files' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own campaign files" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'campaign-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Políticas de storage para graphic-pieces (peças gráficas públicas)
CREATE POLICY "Graphic pieces are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'graphic-pieces');

CREATE POLICY "Users can upload their own graphic pieces" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'graphic-pieces' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own graphic pieces" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'graphic-pieces' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own graphic pieces" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'graphic-pieces' AND auth.uid()::text = (storage.foldername(name))[1]);