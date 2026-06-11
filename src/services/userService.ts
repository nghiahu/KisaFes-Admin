import { axiosClient } from './axiosClient';

// Matches AdminUserResponse from backend
export interface AdminUser {
  id: string;
  fullName: string;
  email: string;
  userName: string;
  avatar?: string;
  roles: string[];      // e.g. ["ROLE_USER"]
  active: boolean;
  createdAt: string;
}

export interface AdminUserDetail {
  user: AdminUser;
  stats: {
    projectsJoined: number;
    pendingTasks: number;
  };
}

// Matches backend PageResponse<T>
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const userService = {
  getUsers: (page: number, size: number, search: string, roleType: string = 'ALL', status: string = 'ALL', sortBy: string = 'createdAt', sortDirection: string = 'DESC') => {
    return axiosClient.get<any, PageResponse<AdminUser>>('/api/v1/admin/users', {
      params: { page, size, search, roleType, status, sortBy, sortDirection }
    });
  },
  getUserDetail: (id: string) => {
    return axiosClient.get<any, AdminUserDetail>(`/api/v1/admin/users/${id}`);
  },
  bulkAction: (action: 'ban' | 'activate' | 'delete', userIds: string[]) => {
    return axiosClient.post<any, void>('/api/v1/admin/users/bulk-action', { action, userIds });
  },
  changeRole: (id: string, role: string) => {
    return axiosClient.patch<any, AdminUser>(`/api/v1/admin/users/${id}/role`, { role });
  },
  toggleStatus: (id: string) => {
    return axiosClient.patch<any, AdminUser>(`/api/v1/admin/users/${id}/status`);
  },
};
