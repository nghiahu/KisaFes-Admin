import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../shared/assets/icons';
import { userService } from '../../services/userService';
import ConfirmActionModal from './ConfirmActionModal';
import { Button } from '../../components/ui/Button';
import type { UserDetailDrawerProps } from '../../types';


export default function UserDetailDrawer({ userId, onClose }: UserDetailDrawerProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [confirmAction, setConfirmAction] = useState<'ban' | 'activate' | null>(null);

  const { data: detail, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUserDetail(userId),
  });

  const statusMutation = useMutation({
    mutationFn: () => userService.toggleStatus(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setConfirmAction(null);
    },
  });

  const user = detail?.user;
  const stats = detail?.stats;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return createPortal(
    <>
      <div className="fixed inset-0 bg-background/80 z-40" onClick={onClose} />
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-card shadow-2xl z-50 flex flex-col border-l border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">Chi tiết người dùng</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted h-auto w-auto"
          >
            <Icons.x size={20} />
          </Button>
        </div>

        {isLoading || !user ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground font-medium">Đang tải...</div>
        ) : (
          <div className="flex-1 overflow-y-auto relative">
            {/* Profile Header */}
            <div className="p-6 border-b border-border bg-muted">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-card text-muted-foreground flex items-center justify-center text-2xl font-bold flex-shrink-0 shadow-sm border border-border">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                  ) : (
                    user.fullName?.charAt(0)?.toUpperCase() ?? '?'
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">{user.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  {user.userName && (
                    <p className="text-xs text-muted-foreground mt-0.5">@{user.userName}</p>
                  )}
                  <div className="flex items-center gap-2 mt-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                        user.active
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {user.active ? 'ACTIVE' : 'BANNED'}
                    </span>
                    {user.roles.map((r: string) => {
                      const roleStr = r.replace('ROLE_', '');
                      let roleColor = 'bg-muted text-muted-foreground';
                      if (roleStr.toUpperCase().includes('ADMIN')) roleColor = 'bg-blue-500/10 text-blue-500';
                      
                      return (
                        <span
                          key={r}
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${roleColor}`}
                        >
                          <Icons.shield size={12} className="mr-1" />
                          {roleStr}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="p-6 border-b border-border">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">{t('users.quickActions')}</h4>
              <Button
                variant="outline"
                onClick={() => setConfirmAction(user.active ? 'ban' : 'activate')}
                disabled={statusMutation.isPending}
                className={`w-full px-4 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2 border h-auto ${
                  user.active
                    ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30'
                }`}
              >
                {user.active ? (
                  <><Icons.ban size={16} /> {t('users.banAccount')}</>
                ) : (
                  <><Icons.checkCircle size={16} /> {t('users.activateAccount')}</>
                )}
              </Button>
            </div>

            {/* Stats */}
            {stats && (
              <div className="p-6">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4">{t('users.activityStats')}</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-blue-500/10 text-blue-500 rounded-lg">
                      <Icons.folderTree size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{t('users.stats.projectsJoined')}</p>
                      <p className="text-xl font-bold text-foreground">{stats.projectsJoined}</p>
                    </div>
                  </div>
                  <div className="bg-card border border-border p-4 rounded-xl flex items-center gap-3">
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-lg">
                      <Icons.checkSquare size={20} />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{t('users.stats.pendingTasks')}</p>
                      <p className="text-xl font-bold text-foreground">{stats.pendingTasks ?? 0}</p>
                    </div>
                  </div>
                </div>

                {user.createdAt && (
                  <div className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground bg-card border border-border py-2 rounded-lg">
                    <Icons.calendar size={14} />
                    {t('users.joined')} {new Date(user.createdAt).toLocaleDateString('vi-VN', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                )}
              </div>
            )}
            
            {/* Confirmation Modal Overlay */}
            {confirmAction && (
              <ConfirmActionModal
                action={confirmAction}
                count={1}
                isPending={statusMutation.isPending}
                onCancel={() => setConfirmAction(null)}
                onConfirm={() => statusMutation.mutate()}
              />
            )}
          </div>
        )}
      </div>
    </>,
    document.body
  );
}
