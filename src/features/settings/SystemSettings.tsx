import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icons } from '../../shared/assets/icons';
import { settingsService } from '../../services/settingsService';
import type { SystemSettings } from '../../services/settingsService';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../hooks/useTheme';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import toast from 'react-hot-toast';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../components/ui/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Label } from '@/components/ui/Label';

const formSchema = z.object({
  companyName: z.string().min(1, { message: 'Required' }),
  supportEmail: z.string().email({ message: 'Invalid email' }),
  allowRegistration: z.boolean(),
  maintenanceMode: z.boolean(),
  maxUploadSizeMB: z.number().min(1).max(500)
});

type FormValues = z.infer<typeof formSchema>;

export default function SystemSettings() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsService.getSettings(),
  });

  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      companyName: '',
      supportEmail: '',
      allowRegistration: false,
      maintenanceMode: false,
      maxUploadSizeMB: 10
    }
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<SystemSettings>) => settingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings saved successfully!');
    }
  });

  const onSubmit = (data: FormValues) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return <div className="p-8 text-muted-foreground">Loading settings...</div>;
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">{t('settings.title')}</h2>
        <p className="text-muted-foreground text-sm mt-1">{t('settings.description')}</p>
      </div>

      <div className="space-y-6">
        
        {/* Appearance & Localization */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-colors">
          <div className="px-6 py-4 border-b border-border bg-muted transition-colors">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Icons.refreshCw size={18} className="text-info" /> {t('settings.appearance')}
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label className="block text-sm font-medium text-muted-foreground mb-1">{t('settings.language')}</Label>
                <select 
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                >
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                </select>
              </div>
              <div>
                <Label className="block text-sm font-medium text-muted-foreground mb-1">{t('settings.theme')}</Label>
                <select 
                  value={theme}
                  onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
                  className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                >
                  <option value="light">{t('settings.themeLight')}</option>
                  <option value="dark">{t('settings.themeDark')}</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* General Settings */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-colors">
              <div className="px-6 py-4 border-b border-border bg-muted transition-colors">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Icons.building2 size={18} className="text-primary" /> {t('settings.general')}
                </h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.companyName')}</FormLabel>
                        <div className="relative">
                          <Icons.building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <FormControl>
                            <Input {...field} className="pl-9 bg-background" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="supportEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.supportEmail')}</FormLabel>
                        <div className="relative">
                          <Icons.mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                          <FormControl>
                            <Input {...field} type="email" className="pl-9 bg-background" />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Security & Access */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-colors">
              <div className="px-6 py-4 border-b border-border bg-muted transition-colors">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Icons.shield size={18} className="text-success" /> {t('settings.security')}
                </h3>
              </div>
              <div className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="allowRegistration"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between space-y-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t('settings.allowReg')}</p>
                        <p className="text-xs text-muted-foreground">{t('settings.allowRegDesc')}</p>
                      </div>
                      <FormControl>
                        <Label className="relative inline-flex items-center cursor-pointer">
                          <Input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            name={field.name}
                          />
                          <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                        </Label>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maintenanceMode"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 space-y-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t('settings.maintenance')}</p>
                        <p className="text-xs text-muted-foreground">{t('settings.maintenanceDesc')}</p>
                      </div>
                      <FormControl>
                        <Label className="relative inline-flex items-center cursor-pointer">
                          <Input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={field.value}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            ref={field.ref}
                            name={field.name}
                          />
                          <div className="w-11 h-6 bg-background peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-destructive"></div>
                        </Label>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Storage */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden transition-colors">
              <div className="px-6 py-4 border-b border-border bg-muted transition-colors">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Icons.hardDrive size={18} className="text-warning" /> {t('settings.storage')}
                </h3>
              </div>
              <div className="p-6">
                <div className="max-w-xs">
                  <FormField
                    control={form.control}
                    name="maxUploadSizeMB"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('settings.maxUpload')}</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            type="number" 
                            min="1"
                            max="500"
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="bg-background"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button 
                variant="outline"
                type="button" 
                onClick={() => {
                  if (settings) form.reset(settings);
                }}
                className="flex items-center gap-2"
              >
                <Icons.refreshCw size={16} /> {t('settings.revert')}
              </Button>
              <Button 
                type="submit" 
                disabled={updateMutation.isPending}
                className="flex items-center gap-2"
              >
                <Icons.save size={16} /> {updateMutation.isPending ? t('settings.saving') : t('settings.save')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
