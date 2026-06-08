import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Icons } from '../../shared/assets/icons';
import { analyticsService } from '../../services/analyticsService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => analyticsService.getDashboardData() as any,
    staleTime: 5 * 60 * 1000, // cache 5 minutes
  });

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  const formattedDate = `${t('dashboard.today')}, ${today.toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : 'en-US', dateOptions)}`;

  const stats = [
    {
      label: t('dashboard.totalUsers'),
      value: isLoading ? '...' : (analytics?.totalUsers ?? 0).toLocaleString(),
      icon: Icons.users,
      trend: '+12%',
      trendUp: true,
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
    {
      label: t('dashboard.activeUsers'),
      value: isLoading ? '...' : (analytics?.activeUsers ?? 0).toLocaleString(),
      icon: Icons.activity,
      trend: t('dashboard.realtime'),
      trendUp: true,
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500'
    },
    {
      label: t('dashboard.totalBlogs'),
      value: isLoading ? '...' : (analytics?.totalBlogs ?? 0).toLocaleString(),
      icon: Icons.fileText,
      subtitle: t('dashboard.noNewBlogs'),
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500'
    },
    {
      label: t('dashboard.publishedBlogs'),
      value: isLoading ? '...' : (analytics?.publishedBlogs ?? 0).toLocaleString(),
      icon: Icons.checkCircle,
      subtitle: t('dashboard.completionRate0'),
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500'
    },
  ];

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-text-primary tracking-tight mb-1">Dashboard</h2>
          <p className="text-text-secondary">{t('dashboard.overview')}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-panel border border-border-subtle rounded-lg text-text-secondary text-sm font-medium">
          <Icons.calendar size={16} />
          {formattedDate}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-panel border border-border-subtle p-6 rounded-2xl flex flex-col justify-between min-h-[140px] relative overflow-hidden group hover:border-text-secondary transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <p className="text-[15px] font-medium text-text-secondary">{stat.label}</p>
                <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                  <Icon className={stat.iconColor} size={20} />
                </div>
              </div>
              <div className="flex items-end justify-between">
                <h3 className="text-3xl font-bold text-text-primary">{stat.value}</h3>
                {stat.trend && (
                  <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {stat.trendUp && stat.trend !== t('dashboard.realtime') ? <Icons.trendingUp size={14} /> : stat.trend === t('dashboard.realtime') ? <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1" /> : <Icons.trendingDown size={14} />}
                    {stat.trend}
                  </div>
                )}
                {stat.subtitle && (
                  <div className="text-xs font-medium text-text-secondary">
                    {stat.subtitle}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blogs by status */}
        <div className="bg-panel border border-border-subtle p-6 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-text-primary">{t('dashboard.blogsByStatus')}</h3>
            <button className="text-text-secondary hover:text-text-primary transition-colors">
              <Icons.moreVertical size={20} />
            </button>
          </div>
          
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-text-secondary">{t('common.loading')}</div>
          ) : (
            <div className="space-y-6 flex-1">
              {['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED'].map((status) => {
                const statObj = analytics?.blogsByStatus?.find((s: any) => s.name === status);
                const val = statObj ? statObj.value : 0;
                const total = analytics?.totalBlogs || 1;
                const pct = Math.round((val / total) * 100);
                
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs font-bold text-text-secondary mb-2">
                      <span>{status}</span>
                      <span>{val} ({pct}%)</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div className="mt-6 pt-4 border-t border-border-subtle flex justify-between items-center">
            <span className="text-xs text-text-secondary font-medium">{t('dashboard.updated2MinsAgo')}</span>
            <button className="text-sm font-bold text-text-secondary hover:text-text-primary flex items-center gap-1 transition-colors">
              {t('common.viewDetails')} <Icons.arrowRight size={14} />
            </button>
          </div>
        </div>

        {/* User trends */}
        <div className="bg-panel border border-border-subtle p-6 rounded-2xl flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-6 relative z-10">
            <h3 className="text-lg font-bold text-text-primary">{t('dashboard.newUsers6Months')}</h3>
            <div className="flex items-center gap-2 px-3 py-1 bg-background rounded-full text-xs font-bold text-text-secondary">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              {t('dashboard.growth')}
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center text-text-secondary relative z-10">{t('common.loading')}</div>
          ) : !analytics?.userTrends?.length ? (
            <div className="flex-1 flex items-center justify-center text-text-secondary text-sm relative z-10">
              {t('common.noData')}
            </div>
          ) : (
            <div className="h-64 relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.userTrends} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="month" 
                    stroke="#475569" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={{stroke: 'var(--border-subtle)'}} 
                    dy={10}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', borderRadius: '8px', color: 'var(--text-primary)' }}
                    itemStyle={{ color: '#3B82F6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="users" 
                    stroke="#3B82F6" 
                    strokeWidth={4}
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#60A5FA' }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
