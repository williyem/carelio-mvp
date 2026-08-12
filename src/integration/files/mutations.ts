// hooks/useUploadFile.ts
import { useMutation } from '@tanstack/react-query';
import { UploadResponse } from './types';
import { uploadFile } from './api-function';
import { AxiosError } from 'axios';
import { handleApiError } from '@/lib/easy';

export const useUploadFile = () => {
  return useMutation<UploadResponse, AxiosError, File>({
    mutationFn: uploadFile,
    onError: (error: AxiosError) => handleApiError(error),
  });
};
