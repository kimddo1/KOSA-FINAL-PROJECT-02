import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { useAuth } from '../../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const success = await login(form.email, form.password);
    setIsLoading(false);

    if (success) {
      // 개발자 계정이면 기업 홈으로, 일반 사용자는 역할에 따라 이동
      if (form.email === 'dev@test.com') {
        navigate('/corporatehome');
      } else {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && ['ADMIN', 'MANAGER', 'MEMBER', 'EMP'].includes(user.role)) {
          navigate('/corporatehome');
        } else {
          navigate('/');
        }
      }
    } else {
      setError('로그인 실패. 이메일과 비밀번호를 확인하세요.');
    }
  };

  return (
    <Layout title="로그인">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md mx-auto mt-32 justify-center bg-white dark:bg-gray-900 p-8 rounded-lg shadow-lg">
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="이메일"
        />
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          placeholder="비밀번호"
        />
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button 
          type="submit" 
          className={`bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isLoading}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
        <Link to="/signup" className="text-blue-600 text-center hover:text-blue-700">
          계정이 없으신가요? 회원가입
        </Link>
      </form>
    </Layout>
  );
}

export default Login;
