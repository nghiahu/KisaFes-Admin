import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Icons } from '@/assets/icons';
import { analyticsService } from '../../services/analyticsService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';

export default function Dashboard() {
  const { t, i18n } = useTranslation();
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => analyticsService.getDashboardData() as any,
    staleTime: 5 * 60 * 1000,
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
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary'
    },
    {
      label: t('dashboard.activeUsers'),
      value: isLoading ? '...' : (analytics?.activeUsers ?? 0).toLocaleString(),
      icon: Icons.activity,
      trend: t('dashboard.realtime'),
      trendUp: true,
      iconBg: 'bg-success/10',
      iconColor: 'text-success'
    },
    {
      label: t('dashboard.totalBlogs'),
      value: isLoading ? '...' : (analytics?.totalBlogs ?? 0).toLocaleString(),
      icon: Icons.fileText,
      subtitle: t('dashboard.noNewBlogs'),
      iconBg: 'bg-info/10',
      iconColor: 'text-info'
    },
    {
      label: t('dashboard.publishedBlogs'),
      value: isLoading ? '...' : (analytics?.publishedBlogs ?? 0).toLocaleString(),
      icon: Icons.checkCircle,
      subtitle: t('dashboard.completionRate0'),
      iconBg: 'bg-warning/10',
      iconColor: 'text-warning'
    },
  ];

  return (
    <div className="space-y-6 pt-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-foreground tracking-tight mb-1">Dashboard</h2>
          <p className="text-muted-foreground">{t('dashboard.overview')}</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-lg text-muted-foreground text-sm font-medium">
          <Icons.calendar size={16} />
          {formattedDate}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="flex flex-col justify-between min-h-[140px] relative overflow-hidden group hover:border-muted-foreground transition-colors p-0">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[15px] font-medium text-muted-foreground">{stat.label}</p>
                  <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
                    <Icon className={stat.iconColor} size={20} />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <h3 className="text-3xl font-bold text-foreground">
                    {isLoading ? <Skeleton className="h-9 w-20" /> : stat.value}
                  </h3>
                  {stat.trend && !isLoading && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {stat.trendUp && stat.trend !== t('dashboard.realtime') ? <Icons.trendingUp size={14} /> : stat.trend === t('dashboard.realtime') ? <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse mr-1" /> : <Icons.trendingDown size={14} />}
                      {stat.trend}
                    </div>
                  )}
                  {stat.subtitle && !isLoading && (
                    <div className="text-xs font-medium text-muted-foreground">
                      {stat.subtitle}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blogs by status */}
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row justify-between items-center mb-4 pb-0">
            <CardTitle className="text-lg font-bold text-foreground">{t('dashboard.blogsByStatus')}</CardTitle>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground mt-0">
              <Icons.moreVertical size={20} />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 flex flex-col pt-0">
            {isLoading ? (
              <div className="flex-1 flex flex-col justify-center space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/6" />
              </div>
            ) : (
              <div className="space-y-6 flex-1">
                {['DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED'].map((status) => {
                  const statObj = analytics?.blogsByStatus?.find((s: any) => s.name === status);
                  const val = statObj ? statObj.value : 0;
                  const total = analytics?.totalBlogs || 1;
                  const pct = Math.round((val / total) * 100);

                  return (
                    <div key={status}>
                      <div className="flex justify-between text-xs font-bold text-muted-foreground mb-2">
                        <span>{status}</span>
                        <span>{val} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
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

            <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
              <span className="text-xs text-muted-foreground font-medium">{t('dashboard.updated2MinsAgo')}</span>
              <Button variant="ghost" size="sm" className="text-sm font-bold text-muted-foreground hover:text-foreground flex items-center gap-1">
                {t('common.viewDetails')} <Icons.arrowRight size={14} />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User trends */}
        <Card className="flex flex-col relative overflow-hidden">
          <CardHeader className="flex flex-row justify-between items-start mb-2 z-10 pb-0">
            <CardTitle className="text-lg font-bold text-foreground">{t('dashboard.newUsers6Months')}</CardTitle>
            <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full text-xs font-bold text-muted-foreground mt-0">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              {t('dashboard.growth')}
            </div>
          </CardHeader>

          <CardContent className="flex-1 pt-0">
            {isLoading ? (
              <div className="h-64 flex items-end justify-between space-x-2 relative z-10">
                <Skeleton className="h-1/4 w-full" />
                <Skeleton className="h-2/4 w-full" />
                <Skeleton className="h-3/4 w-full" />
                <Skeleton className="h-full w-full" />
                <Skeleton className="h-2/4 w-full" />
              </div>
            ) : !analytics?.userTrends?.length ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm relative z-10 h-64">
                {t('common.noData')}
              </div>
            ) : (
              <div className="h-64 relative w-full z-10 mt-4">
                {(() => {
                  let chartData = [...(analytics.userTrends || [])];
                  if (chartData.length === 1) {
                    chartData = [{ month: 'Prev', users: 0 }, ...chartData, { month: 'Next', users: chartData[0].users }];
                  }
                  return (
                    <ResponsiveContainer width="99%" height={250}>
                      <LineChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="month"
                      stroke="currentColor"
                      className="text-muted-foreground"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="currentColor"
                      className="text-muted-foreground"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }}
                      itemStyle={{ color: '#3B82F6' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="users"
                      stroke="#3B82F6"
                      strokeWidth={4}
                      dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--card))', stroke: '#3B82F6' }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#60A5FA' }}
                    />
                      </LineChart>
                    </ResponsiveContainer>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
