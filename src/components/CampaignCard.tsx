import { Image, Radio, FileText, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useNavigate } from 'react-router-dom';

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  status?: 'active' | 'paused' | 'completed';
  showPecasGraficas?: boolean;
  showSolicitacaoSpot?: boolean;
  showMaterialExplicativo?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

const CampaignCard = ({ 
  id, 
  title, 
  description, 
  coverImage, 
  status = 'active',
  showPecasGraficas = true,
  showSolicitacaoSpot = true,
  showMaterialExplicativo = true,
  onEdit,
  onDelete,
  isAdmin = false
}: CampaignCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-lg shadow-card hover:shadow-card-hover transition-all duration-300 overflow-hidden group cursor-pointer">
      <div className="relative overflow-hidden">
        <img 
          src={coverImage} 
          alt={title}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isAdmin && (
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
                    onEdit?.(id);
                  }}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Edit className="h-4 w-4" />
                  Editar Campanha
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(id);
                  }}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir Campanha
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      
      <div className="p-6">
        <h3 className="text-lg font-semibold text-card-foreground mb-2 line-clamp-1">
          {title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
          {description}
        </p>
        
        <div className="grid grid-cols-1 gap-2">
          {showPecasGraficas && (
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start gap-2 h-9"
              onClick={() => navigate(`/campanha/${id}/pecas-graficas`)}
            >
              <Image className="h-4 w-4" />
              {isAdmin ? 'Peças Gráficas' : 'Baixar Peças'}
            </Button>
          )}
          
          {showSolicitacaoSpot && (
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start gap-2 h-9"
              onClick={() => navigate(`/campanha/${id}/solicitacao-spot`)}
              disabled={!isAdmin}
            >
              <Radio className="h-4 w-4" />
              Solicitação de Spot
            </Button>
          )}
          
          {showMaterialExplicativo && (
            <Button 
              variant="outline" 
              size="sm" 
              className="justify-start gap-2 h-9"
              onClick={() => navigate(`/campanha/${id}/material-explicativo`)}
            >
              <FileText className="h-4 w-4" />
              Material Explicativo
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampaignCard;