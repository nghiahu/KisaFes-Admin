import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '../../shared/assets/icons';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import type { ConfirmActionModalProps } from '../../types';


export default function ConfirmActionModal({ action, count, isPending, onConfirm, onCancel }: ConfirmActionModalProps) {
  const { t } = useTranslation();
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80">
      <div className="bg-card p-6 rounded-2xl border border-border w-full max-w-md shadow-2xl flex flex-col transform transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action === 'ban' ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {action === 'ban' ? <Icons.ban size={20} /> : <Icons.checkCircle size={20} />}
          </div>
          <h3 className="text-xl font-bold text-foreground">
            {action === 'ban' ? t('users.confirmBanTitle') : t('users.confirmActivateTitle')}
          </h3>
        </div>
        
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {action === 'ban' 
            ? t('users.confirmBanDesc', { count }) 
            : t('users.confirmActivateDesc', { count })}
        </p>
        
        <div className="flex items-center justify-end gap-3 mt-auto">
          <Button 
            variant="ghost"
            onClick={onCancel}
          >
            {t('common.cancel')}
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isPending}
            className={`flex items-center gap-2 text-white ${
              action === 'ban' 
                ? 'bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20' 
                : 'bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isPending ? t('common.processing') : (action === 'ban' ? t('users.btnBan') : t('users.btnActivate'))}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
