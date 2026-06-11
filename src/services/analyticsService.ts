import { axiosClient } from './axiosClient';

export interface MonthlyUserStat {
  month: string;
  users: number;
}

export interface BlogStatusStat {
  name: string;
  value: number;
}

export interface AdminAnalytics {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  totalBlogs: number;
  publishedBlogs: number;
  userTrends: MonthlyUserStat[];
  blogsByStatus: BlogStatusStat[];
}

export const analyticsService = {
  getDashboardData: () => {
    return axiosClient.get<any, AdminAnalytics>('/api/v1/admin/analytics');
  },
};
