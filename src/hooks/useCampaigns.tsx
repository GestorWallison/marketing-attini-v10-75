import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Campaign {
  id: string;
  title: string;
  description: string;
  cover_image: string;
  status: 'active' | 'paused' | 'completed';
  user_id: string;
  show_pecas_graficas: boolean;
  show_solicitacao_spot: boolean;
  show_material_explicativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCampaigns((data || []) as Campaign[]);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: 'Erro ao carregar campanhas',
        description: 'Não foi possível carregar as campanhas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const createCampaign = async (campaignData: {
    title: string;
    description: string;
    cover_image?: string;
    status: 'active' | 'paused' | 'completed';
    show_pecas_graficas?: boolean;
    show_solicitacao_spot?: boolean;
    show_material_explicativo?: boolean;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([
          {
            ...campaignData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setCampaigns((prev) => [data as Campaign, ...prev]);
      toast({
        title: 'Campanha criada!',
        description: `A campanha "${campaignData.title}" foi criada com sucesso.`,
      });

      return data;
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast({
        title: 'Erro ao criar campanha',
        description: 'Não foi possível criar a campanha.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateCampaign = async (
    id: string,
    updates: Partial<Campaign>
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setCampaigns((prev) =>
        prev.map((campaign) => (campaign.id === id ? data as Campaign : campaign))
      );

      toast({
        title: 'Campanha atualizada!',
        description: 'A campanha foi atualizada com sucesso.',
      });

      return data;
    } catch (error) {
      console.error('Error updating campaign:', error);
      toast({
        title: 'Erro ao atualizar campanha',
        description: 'Não foi possível atualizar a campanha.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteCampaign = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setCampaigns((prev) => prev.filter((campaign) => campaign.id !== id));
      toast({
        title: 'Campanha excluída!',
        description: 'A campanha foi excluída com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: 'Erro ao excluir campanha',
        description: 'Não foi possível excluir a campanha.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    campaigns,
    loading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    refetch: fetchCampaigns,
  };
};