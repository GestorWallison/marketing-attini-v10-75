import { useState } from 'react';
import CampaignCard from './CampaignCard';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Loader2, Upload, X } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useUserRole } from '@/hooks/useUserRole';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import campaign1 from '@/assets/campaign-1.jpg';

interface FormData {
  nome: string;
  descricao: string;
  showPecasGraficas: boolean;
  showSolicitacaoSpot: boolean;
  showMaterialExplicativo: boolean;
  status: 'publicado' | 'rascunho';
  coverImage?: string;
}

const CampaignGrid = () => {
  const { campaigns, loading, createCampaign, updateCampaign, deleteCampaign } = useCampaigns();
  const { isAdmin } = useUserRole();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<FormData>({
    nome: '',
    descricao: '',
    showPecasGraficas: true,
    showSolicitacaoSpot: true,
    showMaterialExplicativo: true,
    status: 'rascunho'
  });

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      showPecasGraficas: true,
      showSolicitacaoSpot: true,
      showMaterialExplicativo: true,
      status: 'rascunho'
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Erro',
          description: 'Por favor, selecione apenas arquivos de imagem.',
          variant: 'destructive',
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Erro',
          description: 'A imagem deve ter no máximo 5MB.',
          variant: 'destructive',
        });
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    const input = document.getElementById('cover-image') as HTMLInputElement;
    const editInput = document.getElementById('edit-cover-image') as HTMLInputElement;
    if (input) input.value = '';
    if (editInput) editInput.value = '';
  };

  const uploadImage = async (file: File, campaignId: string): Promise<string | null> => {
    try {
      setUploadingImage(true);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${campaignId}-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('campaign-covers')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('campaign-covers')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Erro no upload',
        description: 'Não foi possível fazer upload da imagem.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleEdit = (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign) {
      setEditingCampaign(campaign);
      setFormData({
        nome: campaign.title,
        descricao: campaign.description,
        showPecasGraficas: campaign.show_pecas_graficas || true,
        showSolicitacaoSpot: campaign.show_solicitacao_spot || true,
        showMaterialExplicativo: campaign.show_material_explicativo || true,
        status: campaign.status === 'active' ? 'publicado' : 'rascunho'
      });
      // Clear image preview when opening edit modal
      setImageFile(null);
      setImagePreview(null);
      setIsEditDialogOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (campaign && confirm(`Tem certeza que deseja excluir a campanha "${campaign.title}"?`)) {
      await deleteCampaign(id);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.descricao.trim()) {
      return;
    }

    setSubmitting(true);
    
    try {
      // First create the campaign
      const result = await createCampaign({
        title: formData.nome,
        description: formData.descricao,
        cover_image: campaign1, // Default image initially
        status: formData.status === 'publicado' ? 'active' : 'paused',
        show_pecas_graficas: formData.showPecasGraficas,
        show_solicitacao_spot: formData.showSolicitacaoSpot,
        show_material_explicativo: formData.showMaterialExplicativo,
      });

      if (result && imageFile) {
        // Upload image and update campaign with the new image URL
        const imageUrl = await uploadImage(imageFile, result.id);
        if (imageUrl) {
          await updateCampaign(result.id, { cover_image: imageUrl });
        }
      }

      if (result) {
        resetForm();
        setIsDialogOpen(false);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nome.trim() || !formData.descricao.trim()) {
      return;
    }

    if (editingCampaign) {
      setSubmitting(true);
      
      try {
        let updateData: any = {
          title: formData.nome,
          description: formData.descricao,
          status: (formData.status === 'publicado' ? 'active' : 'paused') as 'active' | 'paused' | 'completed',
          show_pecas_graficas: formData.showPecasGraficas,
          show_solicitacao_spot: formData.showSolicitacaoSpot,
          show_material_explicativo: formData.showMaterialExplicativo,
        };

        // If there's a new image file, upload it and add to update data
        if (imageFile) {
          const imageUrl = await uploadImage(imageFile, editingCampaign.id);
          if (imageUrl) {
            updateData.cover_image = imageUrl;
          }
        }

        const result = await updateCampaign(editingCampaign.id, updateData);

        if (result) {
          resetForm();
          setIsEditDialogOpen(false);
          setEditingCampaign(null);
        }
      } catch (error) {
        console.error('Error updating campaign:', error);
      } finally {
        setSubmitting(false);
      }
    }
  };


  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Campanhas de Marketing
          </h2>
          <p className="text-muted-foreground">
            Gerencie todas as suas campanhas em um só lugar
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Campanha
                </Button>
              </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Nova Campanha</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Campanha *</Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Digite o nome da campanha"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição da Campanha *</Label>
                  <Textarea
                    id="descricao"
                    value={formData.descricao}
                    onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                    placeholder="Digite a descrição da campanha"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover-image">Imagem de Capa</Label>
                  <div className="space-y-3">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-48 object-cover rounded-lg border border-border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={removeImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground mb-2">
                          Clique para fazer upload da imagem de capa
                        </p>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG até 5MB
                        </p>
                      </div>
                    )}
                    <Input
                      id="cover-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Funcionalidades Disponíveis</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="pecas-graficas"
                        checked={formData.showPecasGraficas}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, showPecasGraficas: checked as boolean })
                        }
                      />
                      <Label htmlFor="pecas-graficas">Peças Gráficas</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="solicitacao-spot"
                        checked={formData.showSolicitacaoSpot}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, showSolicitacaoSpot: checked as boolean })
                        }
                      />
                      <Label htmlFor="solicitacao-spot">Solicitação de Spot</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="material-explicativo"
                        checked={formData.showMaterialExplicativo}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, showMaterialExplicativo: checked as boolean })
                        }
                      />
                      <Label htmlFor="material-explicativo">Material Explicativo</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Status da Campanha</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="publicado"
                        checked={formData.status === 'publicado'}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, status: checked ? 'publicado' : 'rascunho' })
                        }
                      />
                      <Label htmlFor="publicado">Publicado</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rascunho"
                        checked={formData.status === 'rascunho'}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, status: checked ? 'rascunho' : 'publicado' })
                        }
                      />
                      <Label htmlFor="rascunho">Rascunho</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Criando...
                      </>
                    ) : (
                      'Criar Campanha'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}

          {/* Modal de Edição */}
          {isAdmin && (
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Editar Campanha</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-nome">Nome da Campanha *</Label>
                  <Input
                    id="edit-nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    placeholder="Digite o nome da campanha"
                    required
                  />
                </div>

                 <div className="space-y-2">
                   <Label htmlFor="edit-descricao">Descrição da Campanha *</Label>
                   <Textarea
                     id="edit-descricao"
                     value={formData.descricao}
                     onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                     placeholder="Digite a descrição da campanha"
                     className="min-h-[100px]"
                     required
                   />
                 </div>

                 <div className="space-y-2">
                   <Label htmlFor="edit-cover-image">Imagem de Capa</Label>
                   <div className="space-y-3">
                     {imagePreview || (editingCampaign && editingCampaign.cover_image) ? (
                       <div className="relative">
                         <img 
                           src={imagePreview || editingCampaign?.cover_image} 
                           alt="Preview" 
                           className="w-full h-48 object-cover rounded-lg border border-border"
                         />
                         <Button
                           type="button"
                           variant="destructive"
                           size="sm"
                           className="absolute top-2 right-2"
                           onClick={removeImage}
                         >
                           <X className="h-4 w-4" />
                         </Button>
                       </div>
                     ) : (
                       <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                         <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                         <p className="text-sm text-muted-foreground mb-2">
                           Clique para fazer upload da nova imagem de capa
                         </p>
                         <p className="text-xs text-muted-foreground">
                           PNG, JPG até 5MB
                         </p>
                       </div>
                     )}
                     <Input
                       id="edit-cover-image"
                       type="file"
                       accept="image/*"
                       onChange={handleImageChange}
                       className="cursor-pointer"
                     />
                   </div>
                 </div>

                <div className="space-y-4">
                  <Label>Funcionalidades Disponíveis</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-pecas-graficas"
                        checked={formData.showPecasGraficas}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, showPecasGraficas: checked as boolean })
                        }
                      />
                      <Label htmlFor="edit-pecas-graficas">Peças Gráficas</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-solicitacao-spot"
                        checked={formData.showSolicitacaoSpot}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, showSolicitacaoSpot: checked as boolean })
                        }
                      />
                      <Label htmlFor="edit-solicitacao-spot">Solicitação de Spot</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-material-explicativo"
                        checked={formData.showMaterialExplicativo}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, showMaterialExplicativo: checked as boolean })
                        }
                      />
                      <Label htmlFor="edit-material-explicativo">Material Explicativo</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Status da Campanha</Label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-publicado"
                        checked={formData.status === 'publicado'}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, status: checked ? 'publicado' : 'rascunho' })
                        }
                      />
                      <Label htmlFor="edit-publicado">Publicado</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="edit-rascunho"
                        checked={formData.status === 'rascunho'}
                        onCheckedChange={(checked) => 
                          setFormData({ ...formData, status: checked ? 'rascunho' : 'publicado' })
                        }
                      />
                      <Label htmlFor="edit-rascunho">Rascunho</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Carregando campanhas...</span>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">Nenhuma campanha encontrada</p>
          {isAdmin && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar primeira campanha
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 justify-center">
          {campaigns.map((campaign) => (
            <CampaignCard
              key={campaign.id}
              id={campaign.id}
              title={campaign.title}
              description={campaign.description}
              coverImage={campaign.cover_image || campaign1}
              status={campaign.status}
              showPecasGraficas={campaign.show_pecas_graficas}
              showSolicitacaoSpot={campaign.show_solicitacao_spot}
              showMaterialExplicativo={campaign.show_material_explicativo}
              onEdit={isAdmin ? handleEdit : undefined}
              onDelete={isAdmin ? handleDelete : undefined}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignGrid;