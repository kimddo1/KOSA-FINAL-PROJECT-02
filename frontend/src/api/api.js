// src/api/api.js
import axios from 'axios';
import mockApi from './mockApi';

// Check if backend is available
const isBackendAvailable = async () => {
  try {
    await axios.get('http://localhost:8000/api/v1/health', { timeout: 2000 });
    return true;
  } catch (error) {
    console.warn('Backend not available, using mock API');
    return false;
  }
};

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1', // 백엔드 주소에 맞게 수정
  withCredentials: false, // 쿠키 인증 시 필요
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10초 타임아웃
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

// Enhanced API with fallback to mock
const enhancedApi = {
  async post(url, data) {
    try {
      return await api.post(url, data);
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.log('Using mock API for POST:', url);
        return await mockApi.post(url, data);
      }
      throw error;
    }
  },

  async get(url) {
    try {
      return await api.get(url);
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.log('Using mock API for GET:', url);
        return await mockApi.get(url);
      }
      throw error;
    }
  },

  async put(url, data) {
    try {
      return await api.put(url, data);
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.log('Using mock API for PUT:', url);
        return await mockApi.put(url, data);
      }
      throw error;
    }
  },

  async delete(url) {
    try {
      return await api.delete(url);
    } catch (error) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
        console.log('Using mock API for DELETE:', url);
        return await mockApi.delete(url);
      }
      throw error;
    }
  }
};

export default enhancedApi;
