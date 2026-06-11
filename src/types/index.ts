import type { CategoryTemplate } from '../services/categoryService';

export interface UserTableProps {
  roleType: 'ADMIN' | 'USER';
  title: string;
  description: string;
}

export interface UserDetailDrawerProps {
  userId: string;
  onClose: () => void;
}

export interface ConfirmActionModalProps {
  action: 'ban' | 'activate';
  count: number;
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface SortableStatusItemProps {
  status: any;
  idx: number;
  updateStatus: (index: number, key: string, value: string) => void;
  removeStatus: (index: number) => void;
}

export interface SortableColumnItemProps {
  col: any;
  idx: number;
  updateColumn: (index: number, key: string, value: any) => void;
  removeColumn: (index: number) => void;
  toggleColumnStatus: (colIndex: number, statusId: string) => void;
  defaultStatuses: any[];
}

export interface CategoryEditorModalProps {
  category: CategoryTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  isSaving: boolean;
}

export interface BlogEditorModalProps {
  blogId: string | null;
  onClose: () => void;
}

export interface BlogDetailProps {
  blogId: string;
  onBack: () => void;
  onEdit: () => void;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  fullname: string;
  avatarUrl?: string;
  roles: string[]; // e.g. ["ROLE_USER", "ROLE_ADMIN"]
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface LoginResponseData {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}
