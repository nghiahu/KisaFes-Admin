import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icons } from '../../shared/assets/icons';
import { userService } from '../../services/userService';
import UserDetailDrawer from './UserDetailDrawer';
import ConfirmActionModal from './ConfirmActionModal';
import { useAppSelector } from '../../hooks/storeHooks';
import { useTranslation } from 'react-i18next';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import type { UserTableProps } from '../../types';


export default function UserTable({ roleType, title, description }: UserTableProps) {
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'ASC' | 'DESC' }>({ key: 'createdAt', direction: 'DESC' });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<'ban' | 'activate' | null>(null);

  const queryClient = useQueryClient();
  const currentUser = useAppSelector(state => state.auth.user);

  const { data, isLoading } = useQuery({
    queryKey: ['users', roleType, page, debouncedSearch, statusFilter, sortConfig],
    queryFn: () => userService.getUsers(page, 15, debouncedSearch, roleType, statusFilter, sortConfig.key, sortConfig.direction) as any,
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ action, userIds }: { action: 'ban' | 'activate', userIds: string[] }) => 
      userService.bulkAction(action, userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setSelectedUsers([]);
    }
  });

  // Filter out current user from view just in case (backend also does this if updated, but good to have)
  const displayUsers = data?.content?.filter((u: any) => u.id !== currentUser?.id) || [];

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value as any);
    setPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig(prev => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'ASC' ? 'DESC' : 'ASC' };
      }
      return { key, direction: 'DESC' };
    });
    setPage(1);
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig.key !== key) return <Icons.chevronDown size={14} className="opacity-30 group-hover:opacity-100 transition-opacity" />;
    return sortConfig.direction === 'ASC' 
      ? <Icons.chevronUp size={14} className="text-blue-400" /> 
      : <Icons.chevronDown size={14} className="text-blue-400" />;
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked && displayUsers.length) {
      setSelectedUsers(displayUsers.map((u: any) => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id: string) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const handleBulkAction = (action: 'ban' | 'activate') => {
    if (selectedUsers.length === 0) return;
    setConfirmAction(action);
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col mb-2">
        <h2 className="text-2xl font-bold text-foreground tracking-tight mb-1">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>

      <div className="flex flex-wrap justify-between items-center bg-background py-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card px-3 py-1.5 rounded-lg border border-border">
            <Icons.filter size={16} className="text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="bg-transparent text-sm font-medium text-foreground focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-card text-foreground">{t('users.allStatus')}</option>
              <option value="ACTIVE" className="bg-card text-emerald-500">{t('users.activeOnly')}</option>
              <option value="INACTIVE" className="bg-card text-rose-500">{t('users.inactiveOnly')}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              type="text"
              placeholder={t('users.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 w-[320px] rounded-xl bg-card"
            />
          </div>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-4 bg-card p-3 rounded-lg border border-border">
          <span className="text-sm font-bold text-foreground mr-2">{selectedUsers.length} {t('users.selected')}</span>
          <Button variant="ghost" size="sm" onClick={() => handleBulkAction('activate')} className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 font-medium">
            <Icons.checkCircle size={16} className="mr-1" /> {t('users.activate')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => handleBulkAction('ban')} className="text-amber-500 hover:text-amber-400 hover:bg-amber-500/10 font-medium">
            <Icons.ban size={16} className="mr-1" /> {t('users.deactivate')}
          </Button>
        </div>
      )}

      <div className="bg-card rounded-2xl shadow-sm overflow-hidden flex flex-col border border-border">
        <div className="overflow-x-auto">
          <Table className="w-full text-left text-sm">
            <TableHeader className="border-b border-border text-muted-foreground text-xs font-bold uppercase tracking-wider bg-muted">
              <TableRow>
                <TableHead className="px-6 py-5 w-16">
                  <div className="flex items-center justify-center">
                    <Input 
                      type="checkbox" 
                      checked={!!displayUsers.length && selectedUsers.length === displayUsers.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 shadow-none p-0"
                    />
                  </div>
                </TableHead>
                <TableHead className="px-6 py-5 cursor-pointer hover:bg-muted transition-colors group" onClick={() => handleSort('fullName')}>
                  <div className="flex items-center gap-2">
                    {t('users.colUser')} {renderSortIcon('fullName')}
                  </div>
                </TableHead>
                <TableHead className="px-6 py-5">{t('users.colRole')}</TableHead>
                <TableHead className="px-6 py-5 cursor-pointer hover:bg-muted transition-colors group" onClick={() => handleSort('active')}>
                  <div className="flex items-center gap-2">
                    {t('users.colStatus')} {renderSortIcon('active')}
                  </div>
                </TableHead>
                <TableHead className="px-6 py-5 cursor-pointer hover:bg-muted transition-colors group" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-2">
                    {t('users.colJoinedAt')} {renderSortIcon('createdAt')}
                  </div>
                </TableHead>
                <TableHead className="px-6 py-5 text-right">{t('users.colActions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border bg-card">
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="px-6 py-8 text-center text-muted-foreground font-medium">{t('users.loadingUsers')}</TableCell></TableRow>
              ) : !displayUsers.length ? (
                <TableRow><TableCell colSpan={6} className="px-6 py-8 text-center text-muted-foreground font-medium">{t('users.noUsersFound')}</TableCell></TableRow>
              ) : (
                displayUsers.map((user: any) => {
                  const roleStr = user.roles?.[0] || 'USER';
                  let roleColor = 'bg-muted text-muted-foreground';
                  if (roleStr.toUpperCase().includes('ADMIN')) roleColor = 'bg-blue-500/10 text-blue-500';
                  if (roleStr.toUpperCase().includes('EDITOR')) roleColor = 'bg-purple-500/10 text-purple-500';

                  return (
                    <TableRow key={user.id} className="hover:bg-muted transition-colors group">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <Input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900 shadow-none p-0"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-muted text-muted-foreground flex items-center justify-center font-bold flex-shrink-0 shadow-sm border border-border">
                              {user.avatar
                                ? <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                                : user.fullName?.charAt(0)?.toUpperCase()}
                            </div>
                            {user.active && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-panel rounded-full"></div>}
                          </div>
                          <div>
                            <p className="font-bold text-foreground group-hover:text-blue-500 transition-colors">{user.fullName}</p>
                            <p className="text-muted-foreground text-xs mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${roleColor}`}>
                          {roleStr}
                        </span>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${user.active ? 'text-emerald-500' : 'text-rose-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {user.active ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-muted-foreground font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'}
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedUserId(user.id)} className="text-muted-foreground hover:text-foreground">
                          <Icons.moreVertical size={18} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-5 border-t border-border flex items-center justify-between bg-muted">
          <span className="text-sm text-muted-foreground font-medium">
            {t('users.pageInfo', { page: page, totalPages: data?.totalPages || 1, totalElements: data?.totalElements || 0 })}
          </span>
          {data?.totalPages !== undefined && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 text-sm font-bold text-muted-foreground"
              >
                {t('users.prev')}
              </Button>
              <div className="flex gap-1">
                {[...Array(data.totalPages || 1)].map((_, i) => (
                  <Button
                    key={i}
                    variant={page === i + 1 ? "default" : "ghost"}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold ${
                      page === i + 1 ? '' : 'text-muted-foreground'
                    }`}
                  >
                    {i + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="ghost"
                disabled={page === (data.totalPages || 1)}
                onClick={() => setPage(p => Math.min((data.totalPages || 1), p + 1))}
                className="px-4 py-2 text-sm font-bold text-muted-foreground"
              >
                {t('users.next')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {selectedUserId && (
        <UserDetailDrawer 
          userId={selectedUserId} 
          onClose={() => setSelectedUserId(null)} 
        />
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <ConfirmActionModal
          action={confirmAction}
          count={selectedUsers.length}
          isPending={bulkActionMutation.isPending}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => {
            bulkActionMutation.mutate({ action: confirmAction, userIds: selectedUsers });
            setConfirmAction(null);
          }}
        />
      )}
    </div>
  );
}
