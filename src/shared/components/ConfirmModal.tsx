import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Icons } from '../assets/icons';
import { Button } from '../../components/ui/Button';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  isLoading = false,
  confirmText,
  cancelText
}: ConfirmModalProps) {
  const { t } = useTranslation();
  
  const finalConfirmText = confirmText || t('common.confirm');
  const finalCancelText = cancelText || t('common.cancel');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 transition-colors duration-200">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md border border-border overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="w-14 h-14 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mb-5 mx-auto border border-destructive/20">
            <Icons.alertCircle size={24} />
          </div>
          <h3 className="text-xl font-bold text-foreground text-center mb-2">{title}</h3>
          <div className="text-muted-foreground text-center text-sm mb-8 leading-relaxed">
            {message}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 h-auto"
            >
              {finalCancelText}
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 h-auto shadow-lg shadow-destructive/20"
            >
              {isLoading ? t('common.processing') : finalConfirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
