import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Icons } from '../../../shared/assets/icons';
import { useTranslation } from 'react-i18next';

interface SortableStatusItemProps {
  status: any;
  idx: number;
  updateStatus: (index: number, key: string, value: string) => void;
  removeStatus: (index: number) => void;
}

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
    <div ref={setNodeRef} style={style} className="flex gap-4 items-start bg-panel p-4 rounded-xl border border-border-subtle relative shadow-sm">
      <div className="absolute left-2 top-1/2 -translate-y-1/2 cursor-grab active:cursor-grabbing text-text-secondary hover:text-text-primary" {...attributes} {...listeners}>
        <Icons.gripVertical size={20} />
      </div>

      <div className="flex-1 space-y-4 pl-6">
        <div className="grid grid-cols-12 gap-4 items-center">
          <div className="col-span-5">
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('categories.statusName')}</label>
            <input
              type="text"
              value={status.label}
              onChange={(e) => updateStatus(idx, 'label', e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border-subtle rounded-lg text-text-primary text-sm focus:border-blue-500 outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('categories.position')}</label>
            <input
              type="number"
              disabled
              value={idx}
              className="w-full px-3 py-2 bg-background border border-border-subtle rounded-lg text-text-secondary text-sm outline-none opacity-50 cursor-not-allowed text-center font-bold"
            />
          </div>
          <div className="col-span-5">
            <label className="block text-xs font-bold text-text-secondary uppercase mb-1">{t('categories.color')}</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={status.color || '#4B5563'}
                onChange={(e) => updateStatus(idx, 'color', e.target.value)}
                className="w-9 h-9 rounded bg-transparent border-0 p-0 cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={status.color || '#4B5563'}
                onChange={(e) => updateStatus(idx, 'color', e.target.value)}
                className="flex-1 px-3 py-2 bg-background border border-border-subtle rounded-lg text-text-primary text-sm focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
      <button onClick={() => removeStatus(idx)} className="mt-6 p-2 text-text-secondary hover:text-red-400 bg-background rounded-lg border border-border-subtle hover:border-red-500/30 transition-colors">
        <Icons.trash2 size={16} />
      </button>
    </div>
  );
}
