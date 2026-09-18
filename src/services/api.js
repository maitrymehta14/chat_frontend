import axios from 'axios';

// Create a configured axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request Interceptor: Inject JWT token into headers dynamically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nexus_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch globally relevant status codes (e.g. 401 Unauthorized)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // If the API returns a 401 Unauthorized, log out the user and redirect to login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_user');

      // Perform window redirect to ensure full state reset
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

// API Endpoints in one single file
export const registerUser = async (name, email, password) => {
  const response = await api.post('/register', {
    user_name: name,
    email,
    password,
  });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/login', {
    email,
    password,
  });
  return response.data;
};

export const getUsers = async () => {
  const response = await api.get('/users');
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const getFriendRequests = async () => {
  const response = await api.get('/friend-requests');
  return response.data;
};

export const sendFriendRequest = async (receiverId) => {
  const response = await api.post('/friend-requests', { receiverId });
  return response.data;
};

export const acceptFriendRequest = async (requestId) => {
  const response = await api.post(`/friend-requests/${requestId}/accept`);
  return response.data;
};

export const rejectFriendRequest = async (requestId) => {
  const response = await api.post(`/friend-requests/${requestId}/reject`);
  return response.data;
};

export const cancelFriendRequest = async (requestId) => {
  const response = await api.post(`/friend-requests/${requestId}/cancel`);
  return response.data;
};

export const getFriends = async () => {
  const response = await api.get('/friends');
  return response.data;
};

export const getMessages = async (userId, limit = 50, before = '') => {
  const response = await api.get(`/messages/${userId}`, {
    params: { limit, before }
  });
  return response.data;
};

export const sendMessageApi = async (userId, content, mediaPayload = {}) => {
  const response = await api.post(`/messages/${userId}`, { content, ...mediaPayload });
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get('/messages/conversations');
  return response.data;
};

export default api;
