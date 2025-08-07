import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface MaterialExplicativo {
  id: string;
  campaign_id: string;
  user_id: string;
  title: string;
  content: string;
  file_url: string | null;
  file_name: string | null;
  file_type: string | null;
  status: 'active' | 'paused' | 'completed';
  order_index: number;
  created_at: string;
  updated_at: string;
}

export const useMaterialExplicativo = (campaignId?: string) => {
  const [materiais, setMateriais] = useState<MaterialExplicativo[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMateriais = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('material_explicativo')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: false });

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setMateriais((data || []) as MaterialExplicativo[]);
    } catch (error) {
      console.error('Error fetching material explicativo:', error);
      toast({
        title: 'Erro ao carregar materiais',
        description: 'Não foi possível carregar os materiais explicativos.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMateriais();
  }, [user, campaignId]);

  const createMaterial = async (materialData: {
    campaign_id: string;
    title: string;
    content: string;
    file_url?: string;
    file_name?: string;
    file_type?: string;
    status: 'active' | 'paused' | 'completed';
    order_index?: number;
  }) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('material_explicativo')
        .insert([
          {
            ...materialData,
            user_id: user.id,
            order_index: materialData.order_index || 0,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setMateriais((prev) => [data as MaterialExplicativo, ...prev]);
      toast({
        title: 'Material criado!',
        description: `O material "${materialData.title}" foi criado com sucesso.`,
      });

      return data;
    } catch (error) {
      console.error('Error creating material:', error);
      toast({
        title: 'Erro ao criar material',
        description: 'Não foi possível criar o material explicativo.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateMaterial = async (
    id: string,
    updates: Partial<MaterialExplicativo>
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('material_explicativo')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setMateriais((prev) =>
        prev.map((material) => (material.id === id ? data as MaterialExplicativo : material))
      );

      toast({
        title: 'Material atualizado!',
        description: 'O material foi atualizado com sucesso.',
      });

      return data;
    } catch (error) {
      console.error('Error updating material:', error);
      toast({
        title: 'Erro ao atualizar material',
        description: 'Não foi possível atualizar o material.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const deleteMaterial = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('material_explicativo')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setMateriais((prev) => prev.filter((material) => material.id !== id));
      toast({
        title: 'Material excluído!',
        description: 'O material foi excluído com sucesso.',
      });

      return true;
    } catch (error) {
      console.error('Error deleting material:', error);
      toast({
        title: 'Erro ao excluir material',
        description: 'Não foi possível excluir o material.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const reorderMateriais = async (materialIds: string[]) => {
    if (!user) return false;

    try {
      const updates = materialIds.map((id, index) => ({
        id,
        order_index: index,
      }));

      for (const update of updates) {
        await supabase
          .from('material_explicativo')
          .update({ order_index: update.order_index })
          .eq('id', update.id)
          .eq('user_id', user.id);
      }

      await fetchMateriais(); // Refresh the list
      return true;
    } catch (error) {
      console.error('Error reordering materials:', error);
      toast({
        title: 'Erro ao reordenar materiais',
        description: 'Não foi possível reordenar os materiais.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    materiais,
    loading,
    createMaterial,
    updateMaterial,
    deleteMaterial,
    reorderMateriais,
    refetch: fetchMateriais,
  };
};