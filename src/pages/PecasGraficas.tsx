import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Download, Plus, Upload, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import campaign1 from '@/assets/campaign-1.jpg';
import campaign2 from '@/assets/campaign-2.jpg';
import campaign3 from '@/assets/campaign-3.jpg';
import { usePecasGraficas } from '@/hooks/usePecasGraficas';
import { useCampaigns } from '@/hooks/useCampaigns';

const PecasGraficas = () => {
  const { campanhaId } = useParams();
  const { toast } = useToast();
  const { campaigns } = useCampaigns();
  const { pecasGraficas, loading, createPecaGrafica, updatePecaGrafica, deletePecaGrafica } = usePecasGraficas(campanhaId);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPeca, setEditingPeca] = useState<any>(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: '',
    link: '',
    arquivo: null as File | null
  });
  const [editFormData, setEditFormData] = useState({
    nome: '',
    tipo: '',
    link: '',
    arquivo: null as File | null
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Extrair nome do arquivo (sem extensão)
      const nomeArquivo = file.name.replace(/\.[^/.]+$/, "");
      
      setFormData(prev => ({ 
        ...prev, 
        arquivo: file,
        nome: nomeArquivo
      }));

      // Se for uma imagem, detectar dimensões
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const tipo = `Imagem ${img.width}x${img.height}`;
          setFormData(prev => ({ ...prev, tipo }));
        };
        img.src = URL.createObjectURL(file);
      } else {
        // Para outros tipos de arquivo
        setFormData(prev => ({ ...prev, tipo: file.type || 'Documento' }));
      }
    }
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Extrair nome do arquivo (sem extensão)
      const nomeArquivo = file.name.replace(/\.[^/.]+$/, "");
      
      setEditFormData(prev => ({ 
        ...prev, 
        arquivo: file,
        nome: nomeArquivo
      }));

      // Se for uma imagem, detectar dimensões
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          const tipo = `Imagem ${img.width}x${img.height}`;
          setEditFormData(prev => ({ ...prev, tipo }));
        };
        img.src = URL.createObjectURL(file);
      } else {
        // Para outros tipos de arquivo
        setEditFormData(prev => ({ ...prev, tipo: file.type || 'Documento' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nome || !formData.tipo || !campanhaId) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    await createPecaGrafica({
      campaign_id: campanhaId,
      title: formData.nome,
      description: formData.tipo,
      file_url: formData.link,
      file_name: formData.arquivo?.name,
      file_size: formData.arquivo?.size,
      file_type: formData.arquivo?.type,
      status: 'active'
    });
    
    setIsModalOpen(false);
    setFormData({ nome: '', tipo: '', link: '', arquivo: null });
  };


  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.nome || !editFormData.tipo || !editingPeca) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive"
      });
      return;
    }

    await updatePecaGrafica(editingPeca.id, {
      title: editFormData.nome,
      description: editFormData.tipo,
      file_url: editFormData.link,
      file_name: editFormData.arquivo?.name,
      file_size: editFormData.arquivo?.size,
      file_type: editFormData.arquivo?.type,
    });
    
    setIsEditModalOpen(false);
    setEditingPeca(null);
    setEditFormData({ nome: '', tipo: '', link: '', arquivo: null });
  };

  const openEditModal = (peca: any) => {
    setEditingPeca(peca);
    setEditFormData({
      nome: peca.title,
      tipo: peca.description || '',
      link: peca.file_url || '',
      arquivo: null
    });
    setIsEditModalOpen(true);
  };

  // Dados das campanhas para buscar a capa correta
  const campaignData = {
    1: { title: 'Campanha de Lançamento de Produto', coverImage: campaign1 },
    2: { title: 'Email Marketing - Black Friday', coverImage: campaign2 },
    3: { title: 'Redes Sociais - Engajamento', coverImage: campaign3 },
    4: { title: 'Campanha de Retargeting', coverImage: campaign1 },
    5: { title: 'Newsletter Mensal', coverImage: campaign2 },
    6: { title: 'Webinar Educativo', coverImage: campaign3 },
  };

  const currentCampaign = campaigns.find(c => c.id === campanhaId) || campaignData[parseInt(campanhaId || '1') as keyof typeof campaignData] || campaignData[1];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Voltar para Campanhas
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Peças Gráficas
            </h1>
            <p className="text-muted-foreground">
              {currentCampaign.title} - Materiais gráficos disponíveis para uso
            </p>
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Adicionar Peça Gráfica
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Nova Peça Gráfica</DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="arquivo">Selecionar Arquivo</Label>
                  <Input
                    id="arquivo"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileChange}
                    required
                  />
                  {formData.arquivo && (
                    <p className="text-sm text-muted-foreground">
                      Arquivo selecionado: {formData.arquivo.name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nome">Nome da Peça</Label>
                  <Input
                    id="nome"
                    type="text"
                    placeholder="Ex: Banner Principal"
                    value={formData.nome}
                    onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo/Dimensões</Label>
                  <Input
                    id="tipo"
                    type="text"
                    placeholder="Ex: Banner 1920x1080"
                    value={formData.tipo}
                    onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="link">Link do Botão Usar</Label>
                  <Input
                    id="link"
                    type="url"
                    placeholder="Ex: https://canva.com/design/exemplo"
                    value={formData.link}
                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1" disabled={!formData.arquivo}>
                    <Upload className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Capa da Campanha */}
        <div className="mb-8 bg-card rounded-lg shadow-card overflow-hidden">
          <div className="relative">
            <img 
              src={currentCampaign.coverImage} 
              alt={currentCampaign.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <h2 className="text-2xl font-bold text-white mb-1">{currentCampaign.title}</h2>
              <p className="text-white/90">Peças Gráficas Disponíveis</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Carregando peças gráficas...</p>
          </div>
        ) : pecasGraficas.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Nenhuma peça gráfica encontrada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pecasGraficas.map((peca) => (
              <div key={peca.id} className="bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group">
                <div className="aspect-video bg-muted flex items-center justify-center relative overflow-hidden">
                  {peca.file_url ? (
                    <img 
                      src={peca.file_url} 
                      alt={peca.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <p className="text-muted-foreground">Sem imagem</p>
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="h-8 w-8 p-0 bg-white/90 hover:bg-white text-foreground shadow-sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-popover border shadow-md z-50">
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(peca);
                          }}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Edit className="h-4 w-4" />
                          Editar Peça
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={async (e) => {
                            e.stopPropagation();
                            await deletePecaGrafica(peca.id);
                          }}
                          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Excluir Peça
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-card-foreground mb-1">
                    {peca.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {peca.description || 'Sem descrição'}
                  </p>
                  
                  <div className="flex gap-2">
                    {peca.file_url && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => window.open(peca.file_url!, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Usar
                      </Button>
                    )}
                    
                    {peca.file_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = peca.file_url!;
                          link.download = peca.file_name || `${peca.title}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Baixar
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Edição de Peça Gráfica */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Editar Peça Gráfica</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-arquivo">Trocar Arquivo (opcional)</Label>
                <Input
                  id="edit-arquivo"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleEditFileChange}
                />
                {editFormData.arquivo && (
                  <p className="text-sm text-muted-foreground">
                    Novo arquivo selecionado: {editFormData.arquivo.name}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-nome">Nome da Peça</Label>
                <Input
                  id="edit-nome"
                  type="text"
                  placeholder="Ex: Banner Principal"
                  value={editFormData.nome}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tipo">Tipo/Dimensões</Label>
                <Input
                  id="edit-tipo"
                  type="text"
                  placeholder="Ex: Banner 1920x1080"
                  value={editFormData.tipo}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, tipo: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-link">Link do Botão Usar</Label>
                <Input
                  id="edit-link"
                  type="url"
                  placeholder="Ex: https://canva.com/design/exemplo"
                  value={editFormData.link}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, link: e.target.value }))}
                  required
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Salvar Alterações
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default PecasGraficas;