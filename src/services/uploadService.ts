import { axiosClient } from './axiosClient';

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response: any = await axiosClient.post('/api/v1/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response; // axios interceptor already unwraps response.data.data
  }
};
