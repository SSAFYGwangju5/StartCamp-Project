import axios from 'axios';

// Render에 배포될 FastAPI 주소를 환경변수(VITE_API_BASE_URL)에서 동적으로 로드합니다.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const boardApi = {
  getPosts: (params) => API.get('/posts', { params }),
  getPost: (id) => API.get(`/posts/${id}`),
  createPost: (data) => API.post('/posts', data),
  updatePost: (id, data) => API.put(`/posts/${id}`, data),
  deletePost: (id, password) => API.delete(`/posts/${id}`, { data: { password } }),
  verifyPassword: (id, password) => API.post(`/posts/${id}/verify-password`, { password })
};

export const chatApi = {
  sendMessage: (message) => API.post('/chat', { message })
};