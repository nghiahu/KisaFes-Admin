import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icons } from '../../shared/assets/icons';
import { notificationService } from '../../services/notificationService';
import type { BroadcastRequest } from '../../services/notificationService';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../components/ui/Form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const formSchema = z.object({
  title: z.string().min(1, { message: 'Required' }),
  message: z.string().min(1, { message: 'Required' }),
  type: z.enum(['INFO', 'WARNING', 'ERROR', 'SUCCESS']),
  targetAudience: z.enum(['ALL', 'ADMINS', 'USERS'])
});

type FormValues = z.infer<typeof formSchema>;

export default function NotificationCenter() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      message: '',
      type: 'INFO',
      targetAudience: 'ALL'
    }
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
      form.reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const onSubmit = (data: FormValues) => {
    broadcastMutation.mutate(data);
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'INFO': return <Icons.info className="text-info" size={20} />;
      case 'WARNING': return <Icons.alertTriangle className="text-warning" size={20} />;
      case 'ERROR': return <Icons.xCircle className="text-destructive" size={20} />;
      case 'SUCCESS': return <Icons.checkCircle className="text-success" size={20} />;
      default: return <Icons.bell className="text-muted-foreground" size={20} />;
    }
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'INFO': return 'bg-info/10 border-info/20';
      case 'WARNING': return 'bg-warning/10 border-warning/20';
      case 'ERROR': return 'bg-destructive/10 border-destructive/20';
      case 'SUCCESS': return 'bg-success/10 border-success/20';
      default: return 'bg-muted border-border';
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Icons.bell className="text-primary" size={24} /> {t('notifications.title')}
          </h2>
          <p className="text-muted-foreground text-sm mt-1">{t('notifications.description')}</p>
        </div>
        <Button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 shadow-sm"
        >
          <Icons.send size={16} />
          <span>{t('notifications.broadcastBtn')}</span>
        </Button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <p className="text-muted-foreground">{t('notifications.loading')}</p>
        ) : notifications?.length === 0 ? (
          <div className="bg-card p-12 rounded-xl border border-border text-center">
            <Icons.bell className="mx-auto text-slate-300 mb-3" size={48} />
            <p className="text-muted-foreground font-medium">{t('notifications.noNotifs')}</p>
          </div>
        ) : (
          notifications?.map(notif => (
            <div key={notif.id} className={`p-4 rounded-xl border flex items-start gap-4 transition-all ${getTypeStyle(notif.type)}`}>
              <div className="p-2 bg-card rounded-full shadow-sm mt-1">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-foreground">{notif.title}</h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">{notif.message}</p>
                  </div>
                  <Button 
                    variant="ghost" size="icon"
                    onClick={() => {
                      if (window.confirm(t('notifications.confirmDelete'))) deleteMutation.mutate(notif.id);
                    }}
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Icons.trash2 size={16} />
                  </Button>
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs font-medium">
                  <span className="text-muted-foreground">{t('notifications.sentBy')}: {notif.sentByName}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-muted-foreground">{t('notifications.target')}: <span className="text-muted-foreground">{notif.targetAudience}</span></span>
                  <span className="text-slate-300">•</span>
                  <span className="text-muted-foreground">{new Date(notif.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Icons.send size={18} className="text-primary" /> {t('notifications.newBroadcast')}
              </h3>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('notifications.formTitle')}</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          className="bg-background" 
                          placeholder={t('notifications.formTitlePlaceholder')} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('notifications.formMessage')}</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field}
                          rows={3}
                          className="resize-none bg-background text-foreground" 
                          placeholder={t('notifications.formMessagePlaceholder')} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('notifications.formType')}</FormLabel>
                        <FormControl>
                          <select 
                            {...field}
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                          >
                            <option value="INFO">{t('notifications.typeInfo')}</option>
                            <option value="SUCCESS">{t('notifications.typeSuccess')}</option>
                            <option value="WARNING">{t('notifications.typeWarning')}</option>
                            <option value="ERROR">{t('notifications.typeError')}</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('notifications.formAudience')}</FormLabel>
                        <FormControl>
                          <select 
                            {...field}
                            className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                          >
                            <option value="ALL">{t('notifications.audienceAll')}</option>
                            <option value="USERS">{t('notifications.audienceUsers')}</option>
                            <option value="ADMINS">{t('notifications.audienceAdmins')}</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 mt-2">
                  <Button 
                    variant="outline"
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="bg-muted hover:bg-background"
                  >
                    {t('notifications.cancelBtn')}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={broadcastMutation.isPending} 
                    className="flex items-center gap-2"
                  >
                    <Icons.send size={16} /> {t('notifications.submitBtn')}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      )}
    </div>
  );
}
