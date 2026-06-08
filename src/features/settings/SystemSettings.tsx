import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icons } from '../../shared/assets/icons';
import { useTranslation } from 'react-i18next';
import { settingsService } from '../../services/settingsService';
import type { SystemSettings } from '../../services/settingsService';
import { useTheme } from '../../hooks/useTheme';
import { toast } from 'react-hot-toast';

export default function SystemSettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<SystemSettings>({
    companyName: '',
    supportEmail: '',
    allowRegistration: false,
    maintenanceMode: false,
    maxUploadSizeMB: 10
  });

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  });

  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<SystemSettings>) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved successfully!');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return <div className="p-8 text-text-secondary">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">{t('settings.title')}</h2>
        <p className="text-text-secondary text-sm mt-1">{t('settings.description')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Appearance & Localization */}
        <div className="bg-panel rounded-xl border border-border-subtle shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-border-subtle bg-panel-hover transition-colors">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Icons.refreshCw size={18} className="text-indigo-600" /> {t('settings.appearance')}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.language')}</label>
                <select 
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-text-primary"
                >
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.theme')}</label>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                  className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-text-primary"
                >
                  <option value="light">{t('settings.themeLight')}</option>
                  <option value="dark">{t('settings.themeDark')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-panel rounded-xl border border-border-subtle shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-border-subtle bg-panel-hover transition-colors">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Icons.building2 size={18} className="text-blue-600" /> {t('settings.general')}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.companyName')}</label>
                <div className="relative">
                  <Icons.building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-text-primary"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.supportEmail')}</label>
                <div className="relative">
                  <Icons.mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="email" 
                    required
                    value={formData.supportEmail}
                    onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-text-primary"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-panel rounded-xl border border-border-subtle shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-border-subtle bg-panel-hover transition-colors">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Icons.shield size={18} className="text-emerald-600" /> {t('settings.security')}
            </h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-primary">{t('settings.allowReg')}</p>
                <p className="text-xs text-text-secondary">{t('settings.allowRegDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.allowRegistration}
                  onChange={(e) => setFormData({ ...formData, allowRegistration: e.target.checked })}
                />
                <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-panel after:border-border-subtle after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-sm font-medium text-text-primary">{t('settings.maintenance')}</p>
                <p className="text-xs text-text-secondary">{t('settings.maintenanceDesc')}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.maintenanceMode}
                  onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                />
                <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-panel after:border-border-subtle after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="bg-panel rounded-xl border border-border-subtle shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-border-subtle bg-panel-hover transition-colors">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <Icons.hardDrive size={18} className="text-purple-600" /> {t('settings.storage')}
            </h3>
          </div>
          <div className="p-6">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-text-secondary mb-1">{t('settings.maxUpload')}</label>
              <input 
                type="number" 
                min="1"
                max="500"
                required
                value={formData.maxUploadSizeMB}
                onChange={(e) => setFormData({ ...formData, maxUploadSizeMB: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-border-subtle rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background text-text-primary"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button 
            type="button" 
            onClick={() => {
              if (settings) setFormData(settings);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary bg-background border border-border-subtle rounded-lg hover:bg-panel-hover transition-colors"
          >
            <Icons.refreshCw size={16} /> {t('settings.revert')}
          </button>
          <button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
          >
            <Icons.save size={16} /> {updateMutation.isPending ? t('settings.saving') : t('settings.save')}
          </button>
        </div>
      </form>
    </div>
  );
}
