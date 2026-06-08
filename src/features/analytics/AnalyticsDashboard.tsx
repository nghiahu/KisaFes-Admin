import { useQuery } from '@tanstack/react-query';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar, Legend
} from 'recharts';
import { analyticsService } from '../../services/analyticsService';

// Use some static tailwind colors for the charts, or css variables if needed. We'll use CSS variables for theme consistency.
const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1', '#8B5CF6'];

export default function AnalyticsDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsService.getDashboardData(),
  });

  if (isLoading) {
    return <div className="p-8 text-slate-500">Loading analytics...</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-text-primary">Analytics & Reports</h2>
        <p className="text-text-secondary text-sm mt-1">Detailed insights into platform usage and performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* User Growth Line Chart */}
        <div className="bg-panel p-6 rounded-xl border border-border-subtle shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary mb-6">User Registration Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.userTrends} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--bg-panel)', color: 'var(--text-primary)' }}
                />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blogs by Status Pie Chart */}
        <div className="bg-panel p-6 rounded-xl border border-border-subtle shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary mb-6">Blogs by Status</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.blogsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {data.blogsByStatus && data.blogsByStatus.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid var(--border-subtle)', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--bg-panel)', color: 'var(--text-primary)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
