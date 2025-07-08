import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES } from '../constants/roles';
import api from '../api/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// 개발자 전용 테스트 계정 정보
const DEV_EMAIL = 'dev@test.com';
const DEV_PASSWORD = 'dev123456';
const DEV_USER = { 
  role: ROLES.MANAGER, 
  id: 1, 
  email: DEV_EMAIL, 
  name: '개발자 테스트 계정',
  company_id: 1,
  isAuthenticated: true
};

// 일반 게스트 사용자 (로그인 전)
const guestUser = { 
  role: ROLES.GUEST, 
  id: null, 
  email: null, 
  name: null,
  company_id: null,
  isAuthenticated: false
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(guestUser);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    if (token && userInfo) {
      setUser(JSON.parse(userInfo));
    } else {
      setUser(guestUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setError(null);
    
    // 개발자 전용 테스트 계정 체크
    if (email === DEV_EMAIL && password === DEV_PASSWORD) {
      console.log('🔐 개발자 테스트 계정으로 로그인');
      localStorage.setItem('token', 'dev_test_token');
      localStorage.setItem('user', JSON.stringify(DEV_USER));
      setUser(DEV_USER);
      return true;
    }
    
    // 일반 로그인 처리
    try {
      const response = await api.post('/auth/login', { email, password });
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      
      const userResponse = await api.get('/auth/me');
      const userData = userResponse.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      return true;
    } catch (err) {
      setError(err.response?.status === 401 
        ? '이메일 또는 비밀번호가 올바르지 않습니다.' 
        : '로그인 실패');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(guestUser);
  };

  const hasRole = (role) => {
    return user && user.role === role;
  };

  const hasAnyRole = (roles) => {
    return user && roles.includes(user.role);
  };

  const hasAllRoles = (roles) => {
    return user && roles.every(role => user.role === role);
  };

  const value = {
    hasRole: (role) => user && user.role === role,
    hasAnyRole: (roles) => user && roles.includes(user.role),
    hasAllRoles: (roles) => user && roles.every(role => user.role === role),
    user,
    setUser,
    isLoading,
    error,
    login,
    logout,
    hasRole,
    hasAnyRole,
    hasAllRoles
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
