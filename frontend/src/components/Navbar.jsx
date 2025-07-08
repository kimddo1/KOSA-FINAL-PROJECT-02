import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { ROLES } from '../constants/roles';
import { useTheme } from '../context/ThemeContext';
import { IoIosMoon } from "react-icons/io";
import { IoSunny } from "react-icons/io5";
import { FaRegBell } from "react-icons/fa";
import { BsPersonCircle } from "react-icons/bs";
import NotiBar from './NotiBar';

function NavBar() {
  const { user, logout } = useAuth();
  const isGuest = !user || user.role === ROLES.GUEST;
  const isUser = user && user.role === ROLES.USER;
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Example notifications
  const notifications = [
    '새로운 지원자가 등록되었습니다.',
    '면접 일정이 변경되었습니다.',
    '채용 공고가 마감되었습니다.',
    '알림 4',
    '알림 5',
    '알림 6',
    '알림 7',
    '알림 8',
    '알림 9',
    '알림 10',
  ];
  const notificationCount = notifications.length;
  const [notiOpen, setNotiOpen] = useState(false);
  const notiRef = useRef();

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notiRef.current && !notiRef.current.contains(event.target)) {
        setNotiOpen(false);
      }
    }
    if (notiOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [notiOpen]);

  const getHomePath = () => {
    if (isGuest || isUser) return '/';
    return '/corporatehome';
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white dark:bg-gray-800 shadow-md">
      <div className="flex justify-between items-center h-16 w-full px-12">
        {/* Logo - Far Left */}
        <div className="flex items-center">
          <Link to={getHomePath()} className="text-blue-600 dark:text-blue-400 font-bold text-2xl">
            Kocruit
          </Link>
        </div>

        {/* Buttons - Far Right */}
        <div className="flex items-center space-x-6">
          {/* Dark Mode Button */}
          <button
            onClick={toggleTheme}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white"
            title="Toggle dark mode"
          >
            {isDarkMode ? (
              <span role="img" aria-label="Light mode"><IoSunny className="text-2xl" /></span>
            ) : (
              <span role="img" aria-label="Dark mode"><IoIosMoon className="text-2xl" /></span>
            )}
          </button>

          {/* Notification Icon Only */}
          {!isGuest && (
            <div className="relative" ref={notiRef}>
              <button
                className="relative focus:outline-none flex items-center"
                onClick={() => setNotiOpen((open) => !open)}
                aria-label="알림"
              >
                <span className="text-2xl flex items-center"><FaRegBell /></span>
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full px-1 py-0.3">
                    {notificationCount}
                  </span>
                )}
              </button>
              {/* Only NotiBar as popup */}
              {notiOpen && (
                <div className="absolute right-0 mt-2 z-50">
                  <NotiBar notifications={notifications} count={notificationCount} />
                </div>
              )}
            </div>
          )}

          {/* Show current user role */}
          {!isGuest && (
            <span className="text-xs text-gray-500 dark:text-gray-300 font-semibold">
              {user.role} {user.email === 'dev@test.com' ? '(개발자)' : ''}
            </span>
          )}

          {/* Profile Icon or Auth Buttons */}
          {isGuest ? (
            <div className="flex items-center space-x-4">
              <Link to="/signup" className="text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium">
                Sign Up
              </Link>
              <Link to="/login" className="bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800 px-4 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
            </div>
          ) : (
            <>
              <Link to="/mypage" className="flex items-center">
                <span className="text-2xl"><BsPersonCircle /></span>
              </Link>
              <button
                onClick={handleLogout}
                className="ml-2 px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 text-xs font-medium"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
