import { AxiosResponse } from 'axios';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const checkResponse = <T>(
  response: AxiosResponse<T>,
  status: number = 200
) => {
  if (!!response && status <= 299) {
    return response?.data;
  }
  if (!!response && response.status === status) {
    return response?.data;
  }
  return null;
};
