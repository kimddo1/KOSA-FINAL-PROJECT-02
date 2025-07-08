import React from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  const role = user?.role || ROLES.GUEST;

  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) {
    return <div>로딩 중...</div>; // 또는 로딩 스피너
  }

  // Define role hierarchy
  const roleHierarchy = {
    [ROLES.GUEST]: ['/', '/login', '/signup'],
    [ROLES.USER]: ['/', '/mypage'],
    [ROLES.EMP]: ['/mypage', '/corporatehome'],
    [ROLES.MEMBER]: ['/mypage', '/corporatehome', '/viewpost', '/applicantlist', '/passedapplicants', '/rejectedapplicants', '/memberschedule'],
    [ROLES.MANAGER]: ['/mypage', '/corporatehome', '/viewpost', '/editpost', '/applicantlist', '/email', '/postrecruitment', '/passedapplicants', '/rejectedapplicants', '/managerschedule'],
    [ROLES.ADMIN]: ['*'] // Admin has access to everything
  };

  const isPublicPath = (path) =>
  path === '/' ||
  path.startsWith('/login') ||
  path.startsWith('/signup') ||
  path.startsWith('/joblist') ||
  path.startsWith('/common/');

  // Check if user's role has access to the current path
  const hasAccess = () => {
    const userRole = user?.role || ROLES.GUEST;
    const allowedPaths = roleHierarchy[userRole];
    // Admin has access to everything
    if (userRole === ROLES.ADMIN) return true;
    // Get current path
    const currentPath = window.location.pathname;

    // 퍼블릭 경로는 모든 권한 허용
    if (isPublicPath(currentPath)) return true;
    // Check if current path is in allowed paths
    return allowedPaths && allowedPaths.some(path => currentPath.startsWith(path));
  };
  
  // 로그인 체크
  if (!user || user.role === ROLES.GUEST) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // requiredRole이 없으면 권한 체크 생략하고 그냥 children 보여줌
  if (!requiredRole) {
    return children;
  }

  // 권한 체크
  if (!hasAccess()) {
    // 로그인은 되어 있지만 권한 부족
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold mb-4 text-red-600">접근 권한이 없습니다</h2>
        <p className="mb-6 text-gray-700">이 페이지에 접근할 수 없습니다.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          이전 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute; 
