import { axiosClient } from './axiosClient';

// Matches backend CategoryResponse
export interface CategoryStatus {
  statusId: string;
  label: string;
  category: string;
  color: string;
}

export interface CategoryBoardColumn {
  name: string;
  mappedStatusIds: string[];
  position: number;
}

export interface CategoryRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface CategoryTemplate {
  id: string;
  name: string;
  description: string;
  defaultStatuses: CategoryStatus[];
  defaultBoardColumns: CategoryBoardColumn[];
  defaultRoles: CategoryRole[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  name: string;
  description: string;
  defaultStatuses?: Omit<CategoryStatus, 'statusId'>[];
  defaultBoardColumns?: CategoryBoardColumn[];
  defaultRoles?: Omit<CategoryRole, 'id'>[];
}

export const categoryService = {
  getCategories: () => {
    return axiosClient.get<any, CategoryTemplate[]>('/api/v1/categories');
  },
  getCategoryById: (id: string) => {
    return axiosClient.get<any, CategoryTemplate>(`/api/v1/categories/${id}`);
  },
  createCategory: (data: CategoryRequest) => {
    return axiosClient.post<any, CategoryTemplate>('/api/v1/categories', data);
  },
  updateCategory: (id: string, data: Partial<CategoryRequest>) => {
    return axiosClient.put<any, CategoryTemplate>(`/api/v1/categories/${id}`, data);
  },
  deleteCategory: (id: string) => {
    return axiosClient.delete<any, void>(`/api/v1/categories/${id}`);
  }
};
