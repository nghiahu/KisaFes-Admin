import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons } from '../../../shared/assets/icons';
import { useTranslation } from 'react-i18next';

interface SortableColumnItemProps {
  col: any;
  idx: number;
  updateColumn: (index: number, key: string, value: any) => void;
  removeColumn: (index: number) => void;
  toggleColumnStatus: (colIndex: number, statusId: string) => void;
  defaultStatuses: any[];
}

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
    <div ref={setNodeRef} style={style} className={`bg-panel p-5 rounded-xl border shadow-sm relative transition-colors ${isEmptyMapping ? 'border-red-500/50' : 'border-border-subtle'}`}>
      <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-text-secondary hover:text-text-primary" {...attributes} {...listeners}>
        <Icons.gripVertical size={20} />
      </div>
      
      <div className="pl-6">
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1 min-w-0">
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('categories.colName')}</label>
            <input
              type="text"
              value={col.name}
              onChange={(e) => updateColumn(idx, 'name', e.target.value)}
              className="w-full max-w-sm px-3 py-2 bg-background border border-border-subtle rounded-lg text-text-primary text-sm font-bold focus:border-blue-500 outline-none"
            />
          </div>
          <div className="w-24">
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('categories.position')}</label>
            <input
              type="number"
              disabled
              value={col.position}
              className="w-full px-3 py-2 bg-background border border-border-subtle rounded-lg text-text-secondary text-sm outline-none opacity-50 cursor-not-allowed"
            />
          </div>
          <button onClick={() => removeColumn(idx)} className="mt-5 p-2 text-text-secondary hover:text-red-400 bg-background rounded-lg border border-border-subtle transition-colors">
            <Icons.trash2 size={16} />
          </button>
        </div>

        <div className={`p-4 rounded-lg border transition-colors ${isEmptyMapping ? 'bg-red-500/5 border-red-500/30' : 'bg-background border-border-subtle'}`}>
          <div className="flex items-center justify-between mb-3">
            <p className={`text-xs font-bold uppercase ${isEmptyMapping ? 'text-red-400' : 'text-text-secondary'}`}>{t('categories.mapStatus')}</p>
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
                <button
                  key={status.statusId}
                  onClick={() => toggleColumnStatus(idx, status.statusId)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border ${
                    isMapped 
                      ? 'bg-panel-hover text-text-primary border-blue-500/50' 
                      : 'bg-transparent text-text-secondary border-border-subtle hover:border-text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: status.color || '#4B5563' }}></div>
                    {status.label}
                  </div>
                </button>
              );
            }) : <span className="text-xs text-rose-400">{t('categories.needStatusFirst')}</span>}
          </div>
          <p className={`text-[10px] mt-2 italic ${isEmptyMapping ? 'text-red-400/80' : 'text-text-secondary'}`}>{t('categories.statusOneColOnly')}</p>
        </div>
      </div>
    </div>
  );
}
