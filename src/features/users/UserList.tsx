import { useState } from 'react';
import { Icons } from '../../shared/assets/icons';
import { useAppSelector } from '../../hooks/storeHooks';
import UserTable from './UserTable';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function UserList() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'USER' | 'ADMIN'>('USER');
  const currentUser = useAppSelector(state => state.auth.user);

  // Check if current user has super admin permission
  const isSuperAdmin = currentUser?.roles?.some(r => r.toUpperCase().includes('SUPER_ADMIN'));

  return (
    <div className="space-y-6 pt-2 font-sans">
      <div className="flex flex-col mb-4">
        <h2 className="text-3xl font-bold text-foreground tracking-tight mb-1">{t('users.management')}</h2>
        <p className="text-muted-foreground">{t('users.managementDesc')}</p>
      </div>

      {isSuperAdmin && (
        <div className="flex gap-4 border-b border-border mb-6">
          <Button
            variant="ghost"
            onClick={() => setActiveTab('USER')}
            className={`pb-3 text-sm font-bold transition-colors relative rounded-none h-auto px-1 ${
              activeTab === 'USER' ? 'text-foreground hover:bg-transparent' : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
            }`}
          >
            {t('users.tabStandard')}
            {activeTab === 'USER' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setActiveTab('ADMIN')}
            className={`pb-3 text-sm font-bold transition-colors relative rounded-none h-auto px-1 ${
              activeTab === 'ADMIN' ? 'text-foreground hover:bg-transparent' : 'text-muted-foreground hover:text-foreground hover:bg-transparent'
            }`}
          >
            {t('users.tabAdmin')}
            {activeTab === 'ADMIN' && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
            )}
          </Button>
        </div>
      )}

      {activeTab === 'USER' && (
        <UserTable 
          roleType="USER" 
          title={t('users.tabStandard')} 
          description={t('users.descStandard')} 
        />
      )}

      {activeTab === 'ADMIN' && isSuperAdmin && (
        <UserTable 
          roleType="ADMIN" 
          title={t('users.tabAdmin')} 
          description={t('users.descAdmin')} 
        />
      )}

      {/* Bottom Cards Mockup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Card className="flex flex-col justify-between">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Icons.shield size={18} />
              </div>
              <span className="text-emerald-500 text-xs font-bold">+12%</span>
            </div>
            <h4 className="text-foreground font-bold mb-1">Security Audit Passed</h4>
            <p className="text-muted-foreground text-xs font-medium leading-relaxed">98.2% of users have 2FA enabled as of this morning.</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Icons.clock3 size={18} />
              </div>
              <span className="text-muted-foreground text-xs font-bold">Last 24h</span>
            </div>
            <h4 className="text-foreground font-bold mb-1">Recent Logs</h4>
            <p className="text-muted-foreground text-xs font-medium leading-relaxed">1,452 permission changes recorded in audit history.</p>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between relative overflow-hidden group">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-3 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Icons.userPlus size={18} />
              </div>
              <span className="text-foreground text-xs font-bold">8 New</span>
            </div>
            <h4 className="text-foreground font-bold mb-1 relative z-10">Onboarding Queue</h4>
            <p className="text-muted-foreground text-xs font-medium leading-relaxed relative z-10">Current pending invitations for system administrators.</p>
            <Icons.users size={100} className="absolute -bottom-4 -right-4 text-border group-hover:text-muted-foreground/30 transition-colors" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
