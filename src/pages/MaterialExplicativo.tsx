import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Download, Edit, PenTool } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import Navbar from '@/components/Navbar';
import campaign1 from '@/assets/campaign-1.jpg';
import { useMaterialExplicativo } from '@/hooks/useMaterialExplicativo';
import { useCampaigns } from '@/hooks/useCampaigns';

const MaterialExplicativo = () => {
  const { campanhaId } = useParams();
  const { campaigns } = useCampaigns();
  const [content, setContent] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isWriteDialogOpen, setIsWriteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Buscar a campanha atual pelos dados reais do Supabase
  const currentCampaign = campaigns.find(campaign => campaign.id === campanhaId);

  // Fallback para caso não encontre a campanha
  const campaignData = currentCampaign ? {
    title: currentCampaign.title,
    coverImage: currentCampaign.cover_image || campaign1
  } : {
    title: 'Campanha não encontrada',
    coverImage: campaign1
  };

  const materialContent = `
# Guia da Campanha de Marketing

## Objetivo da Campanha
Esta campanha visa aumentar a visibilidade da marca e gerar mais leads qualificados através de uma abordagem multi-canal integrada.

## Público-Alvo
- **Demografia**: Adultos de 25-45 anos
- **Interesses**: Tecnologia, inovação, lifestyle
- **Localização**: Principais centros urbanos
- **Comportamento**: Ativos digitalmente, buscam soluções práticas

## Principais Mensagens
1. **Proposta de Valor**: Solução inovadora que simplifica o dia a dia
2. **Diferencial Competitivo**: Tecnologia de ponta com atendimento humanizado
3. **Call to Action**: "Descubra como transformar sua rotina hoje mesmo"

## Canais de Comunicação
- **Digital**: Redes sociais, e-mail marketing, Google Ads
- **Tradicional**: Rádio, outdoor, material impresso
- **Eventos**: Feiras, workshops, demonstrações

## Cronograma
- **Fase 1 (Semanas 1-2)**: Lançamento e awareness
- **Fase 2 (Semanas 3-4)**: Engajamento e conversão
- **Fase 3 (Semanas 5-6)**: Retenção e fidelização

## Métricas de Sucesso
- Alcance: +50% na base atual
- Engajamento: Taxa de clique >3%
- Conversão: +25% em leads qualificados
- ROI: Retorno mínimo de 300%

## Materiais Disponíveis
- Peças gráficas para todas as plataformas
- Scripts para spots de rádio
- Templates de e-mail marketing
- Guias de tom de voz e identidade visual

## Contatos da Equipe
- **Gerente de Campanha**: marketing@empresa.com
- **Designer**: design@empresa.com
- **Copywriter**: copy@empresa.com
- **Mídia**: midia@empresa.com

## Observações Importantes
- Todos os materiais devem seguir o manual da marca
- Aprovações necessárias antes da veiculação
- Relatórios semanais de performance
- Ajustes podem ser feitos conforme resultados

---

*Este documento é confidencial e destinado exclusivamente ao uso interno da equipe de marketing.*
  `;

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([materialContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `material-explicativo-campanha-${campanhaId}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

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
              Material Explicativo
            </h1>
            <p className="text-muted-foreground">
              {campaignData.title} - Documentação completa da campanha
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={isWriteDialogOpen} onOpenChange={setIsWriteDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <PenTool className="h-4 w-4" />
                  Escrever
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Escrever Material Explicativo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Digite o conteúdo do material explicativo..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-[400px]"
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsWriteDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={() => {
                      console.log('Conteúdo salvo:', content);
                      setIsWriteDialogOpen(false);
                    }}>
                      Salvar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={handleDownload} className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Baixar PDF
            </Button>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card overflow-hidden">
          {/* Capa da Campanha */}
          <div className="relative">
            <img 
              src={campaignData.coverImage} 
              alt={campaignData.title}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-6">
              <h2 className="text-2xl font-bold text-white mb-1">{campaignData.title}</h2>
              <p className="text-white/90">Material Explicativo Completo</p>
            </div>
          </div>
          
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Guia Completo da Campanha</h3>
                  <p className="text-muted-foreground">Todas as informações necessárias para executar a campanha</p>
                </div>
              </div>
              
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Editar
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Editar Guia da Campanha</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Edite o conteúdo do guia da campanha..."
                      value={editContent || materialContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[400px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={() => {
                        console.log('Conteúdo editado:', editContent);
                        setIsEditDialogOpen(false);
                      }}>
                        Salvar Alterações
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="p-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <pre className="whitespace-pre-wrap font-sans text-foreground leading-relaxed">
                {materialContent}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialExplicativo;