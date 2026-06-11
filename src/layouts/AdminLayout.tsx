import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Icons } from '@/assets/icons';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { logout } from '../features/auth/authSlice';
import { hasPermission } from '../utils/rbac';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', i18nKey: 'dashboard', icon: Icons.layoutDashboard, permission: undefined },
  { path: '/users', label: 'User Management', i18nKey: 'users', icon: Icons.users, permission: 'USER_VIEW' },
  { path: '/categories', label: 'Category Management', i18nKey: 'categories', icon: Icons.folder, permission: 'CATEGORY_VIEW' },
  { path: '/blogs', label: 'Blog Management', i18nKey: 'blogs', icon: Icons.fileText, permission: 'BLOG_VIEW' },
  { path: '/analytics', label: 'Analytics', i18nKey: 'analytics', icon: Icons.barChart3, permission: 'ANALYTICS_VIEW' },
  { path: '/logs', label: 'Audit Logs', i18nKey: 'logs', icon: Icons.shield, permission: 'AUDIT_LOG_VIEW' },
  { path: '/notifications', label: 'Notification Center', i18nKey: 'notifications', icon: Icons.bell, permission: 'SETTINGS_VIEW' },
  { path: '/settings', label: 'System Settings', i18nKey: 'settings', icon: Icons.settings, permission: 'SETTINGS_VIEW' },
] as const;

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const filteredNavItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(user?.roles?.[0], item.permission as any)
  );

  return (
    <div className="flex h-screen bg-background text-foreground font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-card flex flex-col border-r border-border transition-colors duration-200">
        <div className="h-20 flex flex-col justify-center px-6 border-b border-border">
          <h1 className="font-bold text-foreground text-2xl tracking-wide">AdminPro</h1>
          <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground uppercase mt-0.5 opacity-80">Enterprise Suite</span>
        </div>
        
        <nav className="flex-1 py-4 px-3 overflow-y-auto space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            const translationKey = `sidebar.${item.i18nKey}`; 
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <Icon size={18} className={isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"} />
                <span>{t(translationKey, item.label)}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="px-3 py-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-foreground font-bold border border-border text-sm">
              {user?.fullname?.charAt(0) || (user as any)?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-foreground truncate">{user?.fullname || (user as any)?.fullName || 'Admin User'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email || 'admin@kisafres.com'}</p>
            </div>
          </div>
          
          <div className="space-y-0.5">
            <Button variant="ghost" className="flex items-center justify-start gap-3 px-3 py-2 w-full text-muted-foreground hover:text-foreground hover:bg-muted font-medium text-sm">
              <Icons.helpCircle size={16} />
              <span>{t('layout.help')}</span>
            </Button>
            <Button 
              variant="ghost"
              onClick={handleLogout}
              className="flex items-center justify-start gap-3 px-3 py-2 w-full text-destructive hover:text-destructive/90 hover:bg-destructive/10 font-medium text-sm"
            >
              <Icons.logOut size={16} />
              <span>{t('layout.logout')}</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background transition-colors duration-200">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-border">
          <div className="flex items-center gap-8 flex-1">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">KisaFres Admin</h2>
            <div className="relative max-w-md w-full hidden md:block">
              <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                type="text" 
                placeholder={t('layout.searchPlaceholder')} 
                className="w-full bg-muted border-border rounded-full pl-12 pr-4 h-11"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="w-10 h-10 rounded-full bg-muted text-muted-foreground hover:text-foreground border-border"
            >
              {theme === 'dark' ? <Icons.sun size={18} /> : <Icons.moon size={18} />}
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-8 custom-scrollbar">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
