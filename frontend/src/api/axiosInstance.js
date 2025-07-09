import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // 30초로 늘림
  withCredentials: false // Authorization 쓸 때는 이거 false 또는 생략
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  console.log('토큰 확인:', token); // 토큰 출력
  console.log('요청 URL:', config.url); // 요청 URL 출력
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 에러 인터셉터 추가
instance.interceptors.response.use(
  response => response,
  error => {
    console.error('API 에러 상세:', error.response?.data || error.message);
    console.error('요청 URL:', error.config?.url);
    console.error('요청 메서드:', error.config?.method);
    
    // 토큰 만료 시 자동 로그아웃
    if (error.response?.status === 401) {
      console.log('토큰이 만료되었습니다. 자동 로그아웃 처리');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);
export default instance;
