import { axiosClient } from './axiosClient';

export interface SystemSettings {
  companyName: string;
  supportEmail: string;
  allowRegistration: boolean;
  maintenanceMode: boolean;
  maxUploadSizeMB: number;
}

export const settingsService = {
  getSettings: () => {
    return axiosClient.get<SystemSettings>('/api/v1/admin/settings');
  },
  updateSettings: (data: Partial<SystemSettings>) => {
    return axiosClient.put<SystemSettings>('/api/v1/admin/settings', data);
  }
};
