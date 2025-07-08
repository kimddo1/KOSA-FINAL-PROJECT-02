import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { FaRegStar, FaStar, FaCalendarAlt, FaEnvelope } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/api';
import ViewPostSidebar from '../../components/ViewPostSidebar';

export default function RejectedApplicants() {
  const [rejectedApplicants, setRejectedApplicants] = useState([]);
  const [bookmarkedList, setBookmarkedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { jobPostId } = useParams();
  const navigate = useNavigate();
  const [jobPost, setJobPost] = useState(null);
  const [jobPostLoading, setJobPostLoading] = useState(true);

  useEffect(() => {
    const fetchApplicants = async () => {
      try {
        const res = await api.get(`/applications/job/${jobPostId}/applicants`);
        const data = res.data;
        const filtered = data.filter(app => app.status === 'REJECTED');
        setRejectedApplicants(filtered);
        setBookmarkedList(filtered.map(app => app.isBookmarked === 'Y'));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching rejected applicants:', err);
        setError('불합격자 목록을 불러올 수 없습니다.');
        setLoading(false);
      }
    };

    const fetchJobPost = async () => {
      setJobPostLoading(true);
      try {
        const res = await api.get(`/company/jobposts/${jobPostId}`);
        setJobPost(res.data);
      } catch (err) {
        setJobPost(null);
      } finally {
        setJobPostLoading(false);
      }
    };

    if (jobPostId) {
      fetchApplicants();
      fetchJobPost();
    }
  }, [jobPostId]);

  const calculateAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  if (loading || jobPostLoading) {
    return (
      <Layout>
        <ViewPostSidebar jobPost={jobPost} />
        <div className="h-screen flex items-center justify-center">
          <div className="text-xl">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ViewPostSidebar jobPost={jobPost} />
        <div className="h-screen flex items-center justify-center">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <ViewPostSidebar jobPost={jobPost} />
      <div className="h-screen flex flex-col" style={{ marginLeft: 90 }}>
        {/* Title Box */}
        <div className="bg-white dark:bg-gray-800 shadow px-8 py-4 flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            서류 불합격자 명단
          </div>
          <button
            onClick={() => navigate(`/applicantlist/${jobPostId}`)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            목록으로 돌아가기
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="w-full">
            {/* Filter Tabs + Sort Button */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <button className="px-4 py-2 rounded bg-blue-500 text-white font-semibold">적합</button>
                <button className="px-4 py-2 rounded bg-red-500 text-white font-semibold">부적합</button>
                <button className="px-4 py-2 rounded bg-gray-300 text-gray-700 font-semibold">제외</button>
              </div>
              <button className="text-sm text-gray-700 bg-white border border-gray-300 px-3 py-1 rounded shadow-sm hover:bg-gray-100">
                점수 정렬
              </button>
            </div>

            {/* Applicant Grid */}
            <div className="grid grid-cols-2 gap-4">
              {rejectedApplicants.map((applicant, i) => (
                <div
                  key={applicant.id}
                  className="relative bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 p-4 flex items-center gap-4"
                  style={{ borderRadius: '1.5rem' }}
                >
                  {/* 번호 */}
                  <div className="absolute top-2 left-2 text-xs font-bold text-blue-600">{i + 1}</div>
                  {/* 즐겨찾기 별 버튼 */}
                  <button className="absolute top-2 right-2 text-xl">
                    {bookmarkedList[i] ? (
                      <FaStar className="text-yellow-400" />
                    ) : (
                      <FaRegStar className="text-gray-400" />
                    )}
                  </button>
                  {/* 프로필 이미지 */}
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <i className="fa-solid fa-user text-white text-xl" />
                  </div>
                  {/* 중앙 텍스트 정보 */}
                  <div className="flex flex-col flex-grow">
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
                      {new Date(applicant.appliedAt).toLocaleDateString()}
                    </div>
                    <div className="text-lg font-semibold text-gray-800 dark:text-white">
                      {applicant.name} ({calculateAge(applicant.birthDate)}세)
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {applicant.applicationSource || 'DIRECT'}
                    </div>
                  </div>
                  {/* 점수 원 */}
                  <div className="w-16 h-16 border-2 border-blue-300 rounded-full flex items-center justify-center text-sm font-bold text-gray-800 dark:text-white">
                    {applicant.score || 0}점
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Floating Action Buttons */}Add commentMore actions
        <div className="fixed bottom-8 right-8 flex flex-row gap-4 z-50">
          <button className="w-14 h-14 flex items-center justify-center rounded-full bg-green-500 text-white shadow-lg hover:bg-green-600 transition text-2xl"
            onClick={() => navigate('/email')}>
            <FaEnvelope />
          </button>
        </div>
      </div>
    </Layout>
  );
}
