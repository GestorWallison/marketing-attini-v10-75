import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Navbar from '@/components/Navbar';
import campaign1 from '@/assets/campaign-1.jpg';
import campaign2 from '@/assets/campaign-2.jpg';
import campaign3 from '@/assets/campaign-3.jpg';
import { useSolicitacaoSpot } from '@/hooks/useSolicitacaoSpot';
import { useCampaigns } from '@/hooks/useCampaigns';

interface SolicitacaoSpotInterface {
  id: string;
  texto: string;
  tempoEstimado: number;
  dataCriacao: Date;
  status: 'pendente' | 'em_producao' | 'concluido';
}

const SolicitacaoSpot = () => {
  const { campanhaId } = useParams();
  const { campaigns } = useCampaigns();
  const { solicitacoesSpot, loading, createSolicitacaoSpot } = useSolicitacaoSpot(campanhaId);
  const [textoSpot, setTextoSpot] = useState('');
  const [tempoCalculado, setTempoCalculado] = useState(0);

  // Dados das campanhas para buscar a capa correta
  const campaigns = {
    1: { title: 'Campanha de Lançamento de Produto', coverImage: campaign1 },
    2: { title: 'Email Marketing - Black Friday', coverImage: campaign2 },
    3: { title: 'Redes Sociais - Engajamento', coverImage: campaign3 },
    4: { title: 'Campanha de Retargeting', coverImage: campaign1 },
    5: { title: 'Newsletter Mensal', coverImage: campaign2 },
    6: { title: 'Webinar Educativo', coverImage: campaign3 },
  };

  const currentCampaign = campaigns[parseInt(campanhaId || '1') as keyof typeof campaigns] || campaigns[1];

  // Função para calcular tempo do spot (aproximadamente 150 palavras por minuto)
  const calcularTempo = (texto: string) => {
    const palavras = texto.trim().split(/\s+/).length;
    const segundos = Math.ceil((palavras / 150) * 60);
    setTempoCalculado(segundos);
  };

  const handleTextoChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const novoTexto = e.target.value;
    setTextoSpot(novoTexto);
    calcularTempo(novoTexto);
  };

  const formatarTempo = (segundos: number) => {
    if (segundos < 60) return `${segundos}s`;
    const minutos = Math.floor(segundos / 60);
    const segRestantes = segundos % 60;
    return `${minutos}m ${segRestantes}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido': return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'em_producao': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'pendente': return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'concluido': return 'Concluído';
      case 'em_producao': return 'Em Produção';
      case 'pendente': return 'Pendente';
      default: return status;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const novaSolicitacao: SolicitacaoSpotInterface = {
      id: Date.now().toString(),
      texto: textoSpot,
      tempoEstimado: tempoCalculado,
      dataCriacao: new Date(),
      status: 'pendente'
    };

    setSolicitacoes(prev => [novaSolicitacao, ...prev]);
    setTextoSpot('');
    setTempoCalculado(0);
    
    alert('Solicitação de spot enviada com sucesso!');
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

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Solicitação de Spot
          </h1>
          <p className="text-muted-foreground">
            {currentCampaign.title} - Crie seu texto para spot publicitário
          </p>
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
              <p className="text-white/90">Solicitação de Spot Publicitário</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow-card p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="texto-spot" className="text-base font-medium">
                Texto do Spot
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                Digite o texto que será usado no spot publicitário
              </p>
              <Textarea
                id="texto-spot"
                value={textoSpot}
                onChange={handleTextoChange}
                placeholder="Digite aqui o texto do seu spot..."
                className="min-h-[200px] resize-none"
                required
              />
            </div>

            {textoSpot && (
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-primary" />
                  <span className="font-medium">Tempo Estimado</span>
                </div>
                <div className="text-2xl font-bold text-primary">
                  {formatarTempo(tempoCalculado)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Baseado em {textoSpot.trim().split(/\s+/).length} palavras
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" className="flex-1" disabled={!textoSpot.trim()}>
                Enviar Solicitação
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setTextoSpot('');
                  setTempoCalculado(0);
                }}
              >
                Limpar
              </Button>
            </div>
          </form>
        </div>

        {/* Lista de Solicitações */}
        <div className="mt-8 bg-card rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Solicitações de Spot ({solicitacoes.length})
          </h3>
          
          {solicitacoes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p>Nenhuma solicitação de spot encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {solicitacoes.map((solicitacao) => (
                <div key={solicitacao.id} className="border border-border rounded-lg p-4 bg-background/50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(solicitacao.status)}`}>
                        {getStatusText(solicitacao.status)}
                      </span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {solicitacao.dataCriacao.toLocaleDateString('pt-BR')}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatarTempo(solicitacao.tempoEstimado)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 rounded p-3">
                    <p className="text-sm leading-relaxed">
                      {solicitacao.texto}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-card rounded-lg shadow-card p-6">
          <h3 className="text-lg font-semibold mb-4">Dicas para um bom spot</h3>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Seja claro e objetivo na mensagem</li>
            <li>Use linguagem simples e direta</li>
            <li>Inclua um call-to-action forte</li>
            <li>Spots de 30 segundos são ideais para rádio</li>
            <li>Teste a pronúncia em voz alta</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SolicitacaoSpot;