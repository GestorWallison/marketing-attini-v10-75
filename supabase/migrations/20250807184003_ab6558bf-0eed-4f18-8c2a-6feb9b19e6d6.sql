-- Create campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cover_image TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  show_pecas_graficas BOOLEAN NOT NULL DEFAULT false,
  show_solicitacao_spot BOOLEAN NOT NULL DEFAULT false,
  show_material_explicativo BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pecas_graficas table
CREATE TABLE public.pecas_graficas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size BIGINT,
  file_type TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create material_explicativo table
CREATE TABLE public.material_explicativo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pecas_graficas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_explicativo ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for campaigns
CREATE POLICY "Users can view their own campaigns" 
ON public.campaigns 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own campaigns" 
ON public.campaigns 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own campaigns" 
ON public.campaigns 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own campaigns" 
ON public.campaigns 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for pecas_graficas
CREATE POLICY "Users can view their own pecas_graficas" 
ON public.pecas_graficas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pecas_graficas" 
ON public.pecas_graficas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pecas_graficas" 
ON public.pecas_graficas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pecas_graficas" 
ON public.pecas_graficas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for material_explicativo
CREATE POLICY "Users can view their own material_explicativo" 
ON public.material_explicativo 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own material_explicativo" 
ON public.material_explicativo 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own material_explicativo" 
ON public.material_explicativo 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own material_explicativo" 
ON public.material_explicativo 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pecas_graficas_updated_at
  BEFORE UPDATE ON public.pecas_graficas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_material_explicativo_updated_at
  BEFORE UPDATE ON public.material_explicativo
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();