import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icons } from '../../shared/assets/icons';
import { notificationService } from '../../services/notificationService';
import type { BroadcastRequest } from '../../services/notificationService';
import { useTranslation } from 'react-i18next';

export default function NotificationCenter() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'INFO' as 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS',
    targetAudience: 'ALL' as 'ALL' | 'ADMINS' | 'USERS'
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(),
  });

  const broadcastMutation = useMutation({
    mutationFn: (data: BroadcastRequest) => notificationService.broadcastNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      setIsModalOpen(false);
      setFormData({ title: '', message: '', type: 'INFO', targetAudience: 'ALL' });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    broadcastMutation.mutate(formData);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'INFO': return <Icons.info className="text-blue-500" size={20} />;
      case 'WARNING': return <Icons.alertTriangle className="text-amber-500" size={20} />;
      case 'ERROR': return <Icons.xCircle className="text-rose-500" size={20} />;
      case 'SUCCESS': return <Icons.checkCircle className="text-emerald-500" size={20} />;
      default: return <Icons.bell className="text-text-secondary" size={20} />;
    }
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'INFO': return 'bg-blue-50 border-blue-200';
      case 'WARNING': return 'bg-amber-50 border-amber-200';
      case 'ERROR': return 'bg-rose-50 border-rose-200';
      case 'SUCCESS': return 'bg-emerald-50 border-emerald-200';
      default: return 'bg-panel-hover border-border-subtle';
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            <Icons.bell className="text-blue-600" size={24} /> {t('notifications.title')}
          </h2>
          <p className="text-text-secondary text-sm mt-1">{t('notifications.description')}</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Icons.send size={16} />
          <span>{t('notifications.broadcastBtn')}</span>
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-text-secondary">{t('notifications.loading')}</p>
        ) : notifications?.length === 0 ? (
          <div className="bg-panel p-12 rounded-xl border border-border-subtle text-center">
            <Icons.bell className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-text-secondary font-medium">{t('notifications.noNotifs')}</p>
          </div>
        ) : (
          notifications?.map(notif => (
            <div key={notif.id} className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${getTypeStyle(notif.type)}`}>
              <div className="p-2 bg-panel rounded-full shadow-sm mt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-text-primary">{notif.title}</h3>
                    <p className="text-text-secondary mt-1 text-sm leading-relaxed">{notif.message}</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (window.confirm(t('notifications.confirmDelete'))) deleteMutation.mutate(notif.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 rounded transition-colors"
                  >
                    <Icons.trash2 size={16} />
                  </button>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs font-medium">
                  <span className="text-text-secondary">{t('notifications.sentBy')}: {notif.sentByName}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-text-secondary">{t('notifications.target')}: <span className="text-text-secondary">{notif.targetAudience}</span></span>
                  <span className="text-slate-300">•</span>
                  <span className="text-text-secondary">{new Date(notif.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-panel rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border-subtle flex justify-between items-center bg-panel-hover">
              <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <Icons.send size={18} className="text-blue-600" /> {t('notifications.newBroadcast')}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{t('notifications.formTitle')}</label>
                <input 
                  required type="text" 
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder={t('notifications.formTitlePlaceholder')} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{t('notifications.formMessage')}</label>
                <textarea 
                  required rows={3}
                  value={formData.message} 
                  onChange={e => setFormData({...formData, message: e.target.value})} 
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                  placeholder={t('notifications.formMessagePlaceholder')} 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{t('notifications.formType')}</label>
                  <select 
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value as any})} 
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="INFO">{t('notifications.typeInfo')}</option>
                    <option value="SUCCESS">{t('notifications.typeSuccess')}</option>
                    <option value="WARNING">{t('notifications.typeWarning')}</option>
                    <option value="ERROR">{t('notifications.typeError')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">{t('notifications.formAudience')}</label>
                  <select 
                    value={formData.targetAudience} 
                    onChange={e => setFormData({...formData, targetAudience: e.target.value as any})} 
                    className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">{t('notifications.audienceAll')}</option>
                    <option value="USERS">{t('notifications.audienceUsers')}</option>
                    <option value="ADMINS">{t('notifications.audienceAdmins')}</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="px-4 py-2 text-sm font-medium text-text-secondary bg-panel-hover rounded-lg hover:bg-background"
                >
                  {t('notifications.cancelBtn')}
                </button>
                <button 
                  type="submit" 
                  disabled={broadcastMutation.isPending} 
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Icons.send size={16} /> {t('notifications.submitBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
