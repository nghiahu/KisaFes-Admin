import { axiosClient } from './axiosClient';
import type { PageResponse } from './userService';

export type AuditActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'OTHER';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: AuditActionType;
  entity: string;
  entityId?: string;
  details: string;
  ipAddress: string;
  timestamp: string;
}

export const auditLogService = {
  getLogs: (page: number, size: number, search: string, action?: AuditActionType | '') => {
    return axiosClient.get<PageResponse<AuditLog>>('/api/v1/admin/audit-logs', {
      params: { page, size, search, ...(action ? { action } : {}) }
    });
  },
};
