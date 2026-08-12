import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/integration/config';

let socket: Socket | null = null;
let authToken: string | null = null;
let userType: string | null = null;

async function fetchSocketAuth(): Promise<{
  token: string;
  userType: string;
} | null> {
  try {
    const response = await fetch('/api/socket-auth');
    if (!response.ok) {
      console.error('Failed to get socket auth');
      return null;
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching socket auth:', error);
    return null;
  }
}

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(API_BASE_URL, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
      auth: {
        token: authToken,
        userType: userType,
      },
    });
  }
  return socket;
};

export const connectSocket = async (): Promise<void> => {
  // Fetch auth token first
  const auth = await fetchSocketAuth();
  if (auth) {
    authToken = auth.token;
    userType = auth.userType;
  }

  // Recreate socket with auth if we have a token
  if (authToken && socket) {
    socket.auth = { token: authToken, userType };
  }

  const s = getSocket();
  if (!s.connected) {
    // Update auth before connecting
    if (authToken) {
      s.auth = { token: authToken, userType };
    }
    s.connect();
  }
};

export const disconnectSocket = (): void => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

export const isSocketConnected = (): boolean => {
  return socket?.connected ?? false;
};
