-- Primeiro, vamos atualizar a tabela campaigns para incluir os campos necessários
ALTER TABLE public.campaigns 
ADD COLUMN show_pecas_graficas BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN show_solicitacao_spot BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN show_material_explicativo BOOLEAN NOT NULL DEFAULT true;

-- Criar tabela para peças gráficas
CREATE TABLE public.pecas_graficas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  file_type TEXT,
  status campaign_status NOT NULL DEFAULT 'paused',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para solicitação de spot
CREATE TABLE public.solicitacao_spot (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_audience TEXT,
  duration INTEGER, -- duração em segundos
  broadcast_date DATE,
  broadcast_time TIME,
  radio_station TEXT,
  budget DECIMAL(10,2),
  status campaign_status NOT NULL DEFAULT 'paused',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para material explicativo
CREATE TABLE public.material_explicativo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  status campaign_status NOT NULL DEFAULT 'paused',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pecas_graficas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solicitacao_spot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_explicativo ENABLE ROW LEVEL SECURITY;

-- RLS Policies para peças gráficas
CREATE POLICY "Users can view their own peças gráficas" 
ON public.pecas_graficas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own peças gráficas" 
ON public.pecas_graficas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own peças gráficas" 
ON public.pecas_graficas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own peças gráficas" 
ON public.pecas_graficas 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies para solicitação de spot
CREATE POLICY "Users can view their own solicitação spot" 
ON public.solicitacao_spot 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own solicitação spot" 
ON public.solicitacao_spot 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own solicitação spot" 
ON public.solicitacao_spot 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own solicitação spot" 
ON public.solicitacao_spot 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies para material explicativo
CREATE POLICY "Users can view their own material explicativo" 
ON public.material_explicativo 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own material explicativo" 
ON public.material_explicativo 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own material explicativo" 
ON public.material_explicativo 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own material explicativo" 
ON public.material_explicativo 
FOR DELETE 
USING (auth.uid() = user_id);

-- Criar triggers para atualização automática de timestamps
CREATE TRIGGER update_pecas_graficas_updated_at
  BEFORE UPDATE ON public.pecas_graficas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_solicitacao_spot_updated_at
  BEFORE UPDATE ON public.solicitacao_spot
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_material_explicativo_updated_at
  BEFORE UPDATE ON public.material_explicativo
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_pecas_graficas_campaign_id ON public.pecas_graficas(campaign_id);
CREATE INDEX idx_pecas_graficas_user_id ON public.pecas_graficas(user_id);
CREATE INDEX idx_pecas_graficas_status ON public.pecas_graficas(status);

CREATE INDEX idx_solicitacao_spot_campaign_id ON public.solicitacao_spot(campaign_id);
CREATE INDEX idx_solicitacao_spot_user_id ON public.solicitacao_spot(user_id);
CREATE INDEX idx_solicitacao_spot_status ON public.solicitacao_spot(status);

CREATE INDEX idx_material_explicativo_campaign_id ON public.material_explicativo(campaign_id);
CREATE INDEX idx_material_explicativo_user_id ON public.material_explicativo(user_id);
CREATE INDEX idx_material_explicativo_status ON public.material_explicativo(status);
CREATE INDEX idx_material_explicativo_order ON public.material_explicativo(order_index);