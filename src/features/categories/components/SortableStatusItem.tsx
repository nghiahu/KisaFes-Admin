import { Label } from '@/components/ui/Label';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons } from '../../../shared/assets/icons';
import { useTranslation } from 'react-i18next';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { SortableStatusItemProps } from '../../../types';


export default function SortableStatusItem({ status, idx, updateStatus, removeStatus }: SortableStatusItemProps) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: status.statusId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex gap-4 items-start bg-card p-4 rounded-xl border border-border relative shadow-sm">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground" {...attributes} {...listeners}>
        <Icons.gripVertical size={20} />
      </div>

      <div className="flex-1 space-y-4 pl-6">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-5">
            <Label className="block text-xs font-bold text-muted-foreground uppercase mb-1">{t('categories.statusName')}</Label>
            <Input
              type="text"
              value={status.label}
              onChange={(e) => updateStatus(idx, 'label', e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="col-span-2">
            <Label className="block text-xs font-bold text-muted-foreground uppercase mb-1">{t('categories.position')}</Label>
            <Input
              type="number"
              disabled
              value={idx}
              className="bg-background opacity-50 cursor-not-allowed text-center font-bold"
            />
          </div>
          <div className="col-span-5">
            <Label className="block text-xs font-bold text-muted-foreground uppercase mb-1">{t('categories.color')}</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                value={status.color || '#4B5563'}
                onChange={(e) => updateStatus(idx, 'color', e.target.value)}
                className="w-9 h-9 rounded bg-transparent border-0 p-0 cursor-pointer shrink-0 shadow-none h-[36px]"
              />
              <Input
                type="text"
                value={status.color || '#4B5563'}
                onChange={(e) => updateStatus(idx, 'color', e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
        </div>
      </div>
      <Button variant="outline" size="icon" onClick={() => removeStatus(idx)} className="mt-6 text-muted-foreground hover:text-red-400 bg-background hover:border-red-500/30">
        <Icons.trash2 size={16} />
      </Button>
    </div>
  );
}
