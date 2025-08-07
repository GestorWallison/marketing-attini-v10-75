import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SolicitacaoSpot {
  id: string;
  campaign_id: string;
  user_id: string;
  title: string;
  description: string | null;
  target_audience: string | null;
  duration: number | null;
  broadcast_date: string | null;
  broadcast_time: string | null;
  radio_station: string | null;
  budget: number | null;
  status: 'active' | 'paused' | 'completed';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const useSolicitacaoSpot = (campaignId?: string) => {
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSolicitacoes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('solicitacao_spot')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSolicitacoes((data || []) as SolicitacaoSpot[]);
    } catch (error) {
      console.error('Error fetching solicitações de spot:', error);
      toast({
        title: 'Erro ao carregar solicitações',
        description: 'Não foi possível carregar as solicitações de spot.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, [user, campaignId]);

  const createSolicitacao = async (solicitacaoData: {
    campaign_id: string;
    title: string;
    description?: string;
    target_audience?: string;
    duration?: number;
    broadcast_date?: string;
    broadcast_time?: string;
    radio_station?: string;
    budget?: number;
    status: 'active' | 'paused' | 'completed';
    notes?: string;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('solicitacao_spot')
        .insert([
          {
            ...solicitacaoData,
            user_id: user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSolicitacoes((prev) => [data as SolicitacaoSpot, ...prev]);
      toast({
        title: 'Solicitação criada!',
        description: `A solicitação "${solicitacaoData.title}" foi criada com sucesso.`,
      });

      return data;
    } catch (error) {
      console.error('Error creating solicitação:', error);
      toast({
        title: 'Erro ao criar solicitação',
        description: 'Não foi possível criar a solicitação de spot.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateSolicitacao = async (
    id: string,
    updates: Partial<SolicitacaoSpot>
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('solicitacao_spot')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setSolicitacoes((prev) =>
        prev.map((solicitacao) => (solicitacao.id === id ? data as SolicitacaoSpot : solicitacao))
      );

      toast({
        title: 'Solicitação atualizada!',
        description: 'A solicitação foi atualizada com sucesso.',
      });

      return data;
    } catch (error) {
      console.error('Error updating solicitação:', error);
      toast({
        title: 'Erro ao atualizar solicitação',
        description: 'Não foi possível atualizar a solicitação.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteSolicitacao = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('solicitacao_spot')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setSolicitacoes((prev) => prev.filter((solicitacao) => solicitacao.id !== id));
      toast({
        title: 'Solicitação excluída!',
        description: 'A solicitação foi excluída com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Error deleting solicitação:', error);
      toast({
        title: 'Erro ao excluir solicitação',
        description: 'Não foi possível excluir a solicitação.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    solicitacoes,
    loading,
    createSolicitacao,
    updateSolicitacao,
    deleteSolicitacao,
    refetch: fetchSolicitacoes,
  };
};