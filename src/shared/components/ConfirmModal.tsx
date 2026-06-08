import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Icons } from '../assets/icons';

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
      <div className="bg-panel rounded-2xl shadow-2xl w-full max-w-md border border-border-subtle overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="w-14 h-14 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-5 mx-auto border border-red-500/20">
            <Icons.trash2 size={24} />
          </div>
          <h3 className="text-xl font-bold text-text-primary text-center mb-2">{title}</h3>
          <div className="text-text-secondary text-center text-sm mb-8 leading-relaxed">
            {message}
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-panel-hover hover:opacity-80 text-text-secondary hover:text-text-primary font-bold rounded-xl transition-colors border border-border-subtle"
            >
              {finalCancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-red-500/20"
            >
              {isLoading ? t('common.processing') : finalConfirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
