import { create } from 'zustand';
import { HealthAssistantUser } from '@/integration/auth/health-assistant/types';

interface UserStore {
  user: HealthAssistantUser | null;
  setUser: (user: HealthAssistantUser | null) => void;
  clearUser: () => void;
}

const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));

export default useUserStore;
