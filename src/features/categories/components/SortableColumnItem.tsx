import { Label } from '@/components/ui/Label';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons } from '../../../shared/assets/icons';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { SortableColumnItemProps } from '../../../types';


export default function SortableColumnItem({ 
  col, 
  idx, 
  updateColumn, 
  removeColumn, 
  toggleColumnStatus, 
  defaultStatuses 
}: SortableColumnItemProps) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: col.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isEmptyMapping = !col.mappedStatusIds || col.mappedStatusIds.length === 0;

  return (
    <div ref={setNodeRef} style={style} className={`bg-card p-5 rounded-xl border shadow-sm relative transition-colors ${isEmptyMapping ? 'border-red-500/50' : 'border-border'}`}>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground" {...attributes} {...listeners}>
        <Icons.gripVertical size={20} />
      </div>
      
      <div className="pl-6">
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1 min-w-0">
            <Label className="block text-xs font-bold text-muted-foreground uppercase mb-1">{t('categories.colName')}</Label>
            <Input
              type="text"
              value={col.name}
              onChange={(e) => updateColumn(idx, 'name', e.target.value)}
              className="w-full max-w-sm bg-background font-bold"
            />
          </div>
          <div className="w-24">
            <Label className="block text-xs font-bold text-muted-foreground uppercase mb-1">{t('categories.position')}</Label>
            <Input
              type="number"
              disabled
              value={col.position}
              className="bg-background opacity-50 cursor-not-allowed"
            />
          </div>
          <Button variant="outline" size="icon" onClick={() => removeColumn(idx)} className="mt-5 text-muted-foreground hover:text-red-400 bg-background">
            <Icons.trash2 size={16} />
          </Button>
        </div>

        <div className={`p-4 rounded-lg border transition-colors ${isEmptyMapping ? 'bg-red-500/5 border-red-500/30' : 'bg-background border-border'}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-bold uppercase ${isEmptyMapping ? 'text-red-400' : 'text-muted-foreground'}`}>{t('categories.mapStatus')}</p>
            {isEmptyMapping && (
              <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded flex items-center gap-1">
                <Icons.alertCircle size={10} /> {t('categories.emptyCol')}
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {defaultStatuses.length > 0 ? defaultStatuses.map((status: any) => {
              const isMapped = (col.mappedStatusIds || []).includes(status.statusId);
              return (
                <Button
                  variant="outline"
                  key={status.statusId}
                  onClick={() => toggleColumnStatus(idx, status.statusId)}
                  className={`h-auto py-1.5 px-3 text-xs font-bold ${
                    isMapped 
                      ? 'bg-muted text-foreground border-blue-500/50 hover:bg-muted' 
                      : 'bg-transparent text-muted-foreground border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: status.color || '#4B5563' }}></div>
                    {status.label}
                  </div>
                </Button>
              );
            }) : <span className="text-xs text-rose-400">{t('categories.needStatusFirst')}</span>}
          </div>
          <p className={`text-[10px] mt-2 italic ${isEmptyMapping ? 'text-red-400/80' : 'text-muted-foreground'}`}>{t('categories.statusOneColOnly')}</p>
        </div>
      </div>
    </div>
  );
}
