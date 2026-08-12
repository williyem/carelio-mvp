import { ROUTES } from '@/lib/routes';
import { useVideoCallStore } from '@/stores/video-call-store';
import axios from 'axios';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { API_ENDPOINTS } from '@/lib/routes';

export function useLogout() {
  const { endCall } = useVideoCallStore();
  const queryClient = useQueryClient();

  const logout = async () => {
    try {
      // Clear all cookies
      await axios.post(API_ENDPOINTS.clearCookies);

      // Clear video call state
      endCall();

      // Clear React Query cache
      queryClient.clear();

      // Clear localStorage
      localStorage.clear();

      // Redirect to login
      window.location.href = ROUTES.AUTH.LOGIN;
      toast.success('Successfully logged out');
    } catch (error) {
      console.error('Logout error:', error);
      endCall();
      queryClient.clear();
      localStorage.clear();
      window.location.href = ROUTES.AUTH.LOGIN;
      toast.success('Successfully logged out');
    }
  };

  return logout;
}
