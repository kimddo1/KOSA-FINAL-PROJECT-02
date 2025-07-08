// src/api/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // 백엔드 주소에 맞게 수정
  withCredentials: false, // 쿠키 인증 시 필요
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // 30초 타임아웃
});

// 요청 전 인터셉터: 토큰이 있다면 자동으로 추가
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('Current token:', token ? 'exists' : 'missing');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Request headers:', config.headers);
    } else {
      console.warn('No authentication token found');
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터: 에러 로깅 또는 토큰 만료 시 처리 등
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error('Response error:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
      
      if (error.response.status === 401) {
        console.warn('🔒 인증 오류 - 로그인 필요');
        // Clear invalid token
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // You might want to redirect to login here
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;