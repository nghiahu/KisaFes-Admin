import { axiosClient } from './axiosClient';

export type BroadcastType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
export type TargetAudience = 'ALL' | 'ADMINS' | 'USERS';

export interface SystemBroadcast {
  id: string;
  title: string;
  message: string;
  type: BroadcastType;
  targetAudience: TargetAudience;
  sentById: string;
  sentByName: string;
  createdAt: string;
}

export interface BroadcastRequest {
  title: string;
  message: string;
  type: BroadcastType;
  targetAudience: TargetAudience;
}

export const notificationService = {
  getNotifications: () => {
    return axiosClient.get<SystemBroadcast[]>('/api/v1/admin/broadcasts');
  },
  broadcastNotification: (data: BroadcastRequest) => {
    return axiosClient.post<SystemBroadcast>('/api/v1/admin/broadcasts', data);
  },
  deleteNotification: (id: string) => {
    return axiosClient.delete<void>(`/api/v1/admin/broadcasts/${id}`);
  },
};
