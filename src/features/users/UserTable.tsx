import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Icons } from '../../shared/assets/icons';
import { userService } from '../../services/userService';
import UserDetailDrawer from './UserDetailDrawer';
import ConfirmActionModal from './ConfirmActionModal';
import { useAppSelector } from '../../hooks/storeHooks';
import { useTranslation } from 'react-i18next';

interface UserTableProps {
  roleType: 'ADMIN' | 'USER';
  title: string;
  description: string;
}

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
        <h2 className="text-2xl font-bold text-text-primary tracking-tight mb-1">{title}</h2>
        <p className="text-text-secondary text-sm">{description}</p>
      </div>

      <div className="flex flex-wrap justify-between items-center bg-background py-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-panel px-3 py-1.5 rounded-lg border border-border-subtle">
            <Icons.filter size={16} className="text-text-secondary" />
            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="bg-transparent text-sm font-medium text-text-primary focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-panel text-text-primary">{t('users.allStatus')}</option>
              <option value="ACTIVE" className="bg-panel text-emerald-500">{t('users.activeOnly')}</option>
              <option value="INACTIVE" className="bg-panel text-rose-500">{t('users.inactiveOnly')}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
            <input
              type="text"
              placeholder={t('users.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-[320px] bg-panel border border-border-subtle rounded-xl text-sm focus:outline-none focus:border-blue-500 text-text-primary placeholder-text-secondary transition-colors"
            />
          </div>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="flex items-center gap-4 bg-panel p-3 rounded-lg border border-border-subtle">
          <span className="text-sm font-bold text-text-primary mr-2">{selectedUsers.length} {t('users.selected')}</span>
          <button onClick={() => handleBulkAction('activate')} className="text-emerald-500 hover:text-emerald-400 font-medium text-sm flex items-center gap-1">
            <Icons.checkCircle size={16} /> {t('users.activate')}
          </button>
          <button onClick={() => handleBulkAction('ban')} className="text-amber-500 hover:text-amber-400 font-medium text-sm flex items-center gap-1">
            <Icons.ban size={16} /> {t('users.deactivate')}
          </button>
        </div>
      )}

      <div className="bg-panel rounded-2xl shadow-sm overflow-hidden flex flex-col border border-border-subtle">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border-subtle text-text-secondary text-xs font-bold uppercase tracking-wider bg-panel-hover">
              <tr>
                <th className="px-6 py-5 w-16">
                  <div className="flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={!!displayUsers.length && selectedUsers.length === displayUsers.length}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                  </div>
                </th>
                <th className="px-6 py-5 cursor-pointer hover:bg-panel-hover transition-colors group" onClick={() => handleSort('fullName')}>
                  <div className="flex items-center gap-2">
                    {t('users.colUser')} {renderSortIcon('fullName')}
                  </div>
                </th>
                <th className="px-6 py-5">{t('users.colRole')}</th>
                <th className="px-6 py-5 cursor-pointer hover:bg-panel-hover transition-colors group" onClick={() => handleSort('active')}>
                  <div className="flex items-center gap-2">
                    {t('users.colStatus')} {renderSortIcon('active')}
                  </div>
                </th>
                <th className="px-6 py-5 cursor-pointer hover:bg-panel-hover transition-colors group" onClick={() => handleSort('createdAt')}>
                  <div className="flex items-center gap-2">
                    {t('users.colJoinedAt')} {renderSortIcon('createdAt')}
                  </div>
                </th>
                <th className="px-6 py-5 text-right">{t('users.colActions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle bg-panel">
              {isLoading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-text-secondary font-medium">{t('users.loadingUsers')}</td></tr>
              ) : !displayUsers.length ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-text-secondary font-medium">{t('users.noUsersFound')}</td></tr>
              ) : (
                displayUsers.map((user: any) => {
                  const roleStr = user.roles?.[0] || 'USER';
                  let roleColor = 'bg-panel-hover text-text-secondary';
                  if (roleStr.toUpperCase().includes('ADMIN')) roleColor = 'bg-blue-500/10 text-blue-500';
                  if (roleStr.toUpperCase().includes('EDITOR')) roleColor = 'bg-purple-500/10 text-purple-500';

                  return (
                    <tr key={user.id} className="hover:bg-panel-hover transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={() => handleSelectUser(user.id)}
                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedUserId(user.id)}>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-panel-hover text-text-secondary flex items-center justify-center font-bold flex-shrink-0 shadow-sm border border-border-subtle">
                              {user.avatar
                                ? <img src={user.avatar} alt={user.fullName} className="w-full h-full object-cover" />
                                : user.fullName?.charAt(0)?.toUpperCase()}
                            </div>
                            {user.active && <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-panel rounded-full"></div>}
                          </div>
                          <div>
                            <p className="font-bold text-text-primary group-hover:text-blue-500 transition-colors">{user.fullName}</p>
                            <p className="text-text-secondary text-xs mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${roleColor}`}>
                          {roleStr}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${user.active ? 'text-emerald-500' : 'text-rose-500'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                          {user.active ? 'ACTIVE' : 'INACTIVE'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-text-secondary font-medium">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => setSelectedUserId(user.id)} className="text-text-secondary hover:text-text-primary p-2 transition-colors">
                          <Icons.moreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="px-6 py-5 border-t border-border-subtle flex items-center justify-between bg-panel-hover">
          <span className="text-sm text-text-secondary font-medium">
            {t('users.pageInfo', { page: page, totalPages: data?.totalPages || 1, totalElements: data?.totalElements || 0 })}
          </span>
          {data?.totalPages !== undefined && (
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                {t('users.prev')}
              </button>
              <div className="flex gap-1">
                {[...Array(data.totalPages || 1)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors ${
                      page === i + 1 ? 'bg-blue-600 text-white' : 'text-text-secondary hover:bg-panel hover:text-text-primary'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button
                disabled={page === (data.totalPages || 1)}
                onClick={() => setPage(p => Math.min((data.totalPages || 1), p + 1))}
                className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary disabled:opacity-30 transition-colors"
              >
                {t('users.next')}
              </button>
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
