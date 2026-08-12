// integration/upload.ts
import axios from 'axios';
import { UploadResponse } from './types';
import { FILE_ENDPOINTS } from './endpoints';

export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await axios.post<UploadResponse>(
    FILE_ENDPOINTS.uploadFile,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}
