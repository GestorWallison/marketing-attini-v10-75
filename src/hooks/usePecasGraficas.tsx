import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface PecaGrafica {
  id: string;
  campaign_id: string;
  user_id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_name: string | null;
  file_size: number | null;
  file_type: string | null;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

export const usePecasGraficas = (campaignId?: string) => {
  const [pecasGraficas, setPecasGraficas] = useState<PecaGrafica[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPecasGraficas = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('pecas_graficas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPecasGraficas((data || []) as PecaGrafica[]);
    } catch (error) {
      console.error('Error fetching peças gráficas:', error);
      toast({
        title: 'Erro ao carregar peças gráficas',
        description: 'Não foi possível carregar as peças gráficas.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPecasGraficas();
  }, [user, campaignId]);

  const createPecaGrafica = async (pecaData: {
    campaign_id: string;
    title: string;
    description?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    file_type?: string;
    status: 'active' | 'paused' | 'completed';
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('pecas_graficas')
        .insert([
          {
            ...pecaData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setPecasGraficas((prev) => [data as PecaGrafica, ...prev]);
      toast({
        title: 'Peça gráfica criada!',
        description: `A peça gráfica "${pecaData.title}" foi criada com sucesso.`,
      });

      return data;
    } catch (error) {
      console.error('Error creating peça gráfica:', error);
      toast({
        title: 'Erro ao criar peça gráfica',
        description: 'Não foi possível criar a peça gráfica.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updatePecaGrafica = async (
    id: string,
    updates: Partial<PecaGrafica>
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('pecas_graficas')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setPecasGraficas((prev) =>
        prev.map((peca) => (peca.id === id ? data as PecaGrafica : peca))
      );

      toast({
        title: 'Peça gráfica atualizada!',
        description: 'A peça gráfica foi atualizada com sucesso.',
      });

      return data;
    } catch (error) {
      console.error('Error updating peça gráfica:', error);
      toast({
        title: 'Erro ao atualizar peça gráfica',
        description: 'Não foi possível atualizar a peça gráfica.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deletePecaGrafica = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('pecas_graficas')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setPecasGraficas((prev) => prev.filter((peca) => peca.id !== id));
      toast({
        title: 'Peça gráfica excluída!',
        description: 'A peça gráfica foi excluída com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Error deleting peça gráfica:', error);
      toast({
        title: 'Erro ao excluir peça gráfica',
        description: 'Não foi possível excluir a peça gráfica.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    pecasGraficas,
    loading,
    createPecaGrafica,
    updatePecaGrafica,
    deletePecaGrafica,
    refetch: fetchPecasGraficas,
  };
};