import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Icons } from '../shared/assets/icons';
import { useAppDispatch, useAppSelector } from '../hooks/storeHooks';
import { logout } from '../features/auth/authSlice';
import { hasPermission } from '../utils/rbac';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../hooks/useTheme';

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
    <div className="flex h-screen bg-background text-text-secondary font-sans transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-panel flex flex-col border-r border-border-subtle transition-colors duration-200">
        <div className="h-20 flex flex-col justify-center px-6 border-b border-border-subtle">
          <h1 className="font-bold text-text-primary text-2xl tracking-wide">AdminPro</h1>
          <span className="text-[10px] font-bold tracking-[0.2em] text-text-secondary uppercase mt-0.5 opacity-80">Enterprise Suite</span>
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
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-panel-hover'
                }`}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-text-secondary group-hover:text-text-primary"} />
                <span>{t(translationKey, item.label)}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="px-3 py-4 border-t border-border-subtle">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-9 h-9 rounded-lg bg-panel-hover flex items-center justify-center text-text-primary font-bold border border-border-subtle text-sm">
              {user?.fullname?.charAt(0) || user?.fullName?.charAt(0) || 'A'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-text-primary truncate">{user?.fullname || user?.fullName || 'Admin User'}</p>
              <p className="text-[11px] text-text-secondary truncate">{user?.email || 'admin@kisafres.com'}</p>
            </div>
          </div>
          
          <div className="space-y-0.5">
            <button className="flex items-center gap-3 px-3 py-2 w-full text-text-secondary hover:text-text-primary hover:bg-panel-hover rounded-lg transition-colors font-medium text-sm">
              <Icons.helpCircle size={16} />
              <span>{t('layout.help')}</span>
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2 w-full text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors font-medium text-sm"
            >
              <Icons.logOut size={16} />
              <span>{t('layout.logout')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-background transition-colors duration-200">
        {/* Header */}
        <header className="h-20 flex items-center justify-between px-8">
          <div className="flex items-center gap-8 flex-1">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">KisaFres Admin</h2>
            <div className="relative max-w-md w-full hidden md:block">
              <Icons.search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
              <input 
                type="text" 
                placeholder={t('layout.searchPlaceholder')} 
                className="w-full bg-panel-hover text-text-primary border border-border-subtle rounded-full pl-12 pr-4 py-2.5 focus:outline-none focus:border-blue-500 text-sm placeholder-text-secondary transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
              className="w-10 h-10 rounded-full bg-panel-hover flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors border border-border-subtle"
            >
              {theme === 'dark' ? <Icons.sun size={18} /> : <Icons.moon size={18} />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 pb-8 custom-scrollbar will-change-scroll transform-gpu">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
