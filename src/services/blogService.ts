import { axiosClient } from './axiosClient';
import type { PageResponse } from './userService';

export type BlogStatus = 'DRAFT' | 'PENDING' | 'PUBLISHED' | 'ARCHIVED';

export interface Blog {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  authorId: string;
  authorName: string;
  thumbnailUrl: string;
  status: BlogStatus;
  tags: string[];
  views: number;
  createdAt: string;
  updatedAt: string;
  publishAt?: string;
}

export interface BlogRequest {
  title: string;
  excerpt?: string;
  content: string;
  status?: BlogStatus;
  tags?: string[];
  thumbnailUrl?: string;
  publishAt?: string;
}

export interface CreateBlogDto {
  title: string;
  excerpt: string;
  content: string;
  status: BlogStatus;
  thumbnailUrl: string;
  tags: string[];
  publishAt?: string;
}

export const blogService = {
  getBlogs: (page: number, size: number, search: string, status?: BlogStatus | '', sortBy: string = 'createdAt', sortDir: string = 'desc') => {
    return axiosClient.get<PageResponse<Blog>>('/api/v1/admin/blogs', {
      params: { page, size, search, ...(status ? { status } : {}), sortBy, sortDir }
    });
  },
  getBlogById: (id: string) => {
    return axiosClient.get<Blog>(`/api/v1/admin/blogs/${id}`);
  },
  createBlog: (data: BlogRequest) => {
    return axiosClient.post<Blog>('/api/v1/admin/blogs', data);
  },
  updateBlog: (id: string, data: BlogRequest) => {
    return axiosClient.put<Blog>(`/api/v1/admin/blogs/${id}`, data);
  },
  changeStatus: (id: string, status: BlogStatus) => {
    return axiosClient.patch<Blog>(`/api/v1/admin/blogs/${id}/status`, { status });
  },
  deleteBlog: (id: string) => {
    return axiosClient.delete<void>(`/api/v1/admin/blogs/${id}`);
  },
};
