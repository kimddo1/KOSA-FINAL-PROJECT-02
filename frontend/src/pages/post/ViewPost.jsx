import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import { getDefaultSettingsButton } from '../../components/SettingsMenu';
import api from '../../api/api';
import ViewPostSidebar from '../../components/ViewPostSidebar';

function ViewPost() {
  const navigate = useNavigate();
  const { jobPostId } = useParams();
  const { user } = useAuth();
  const isAdminOrManager = user && (user.role === ROLES.ADMIN || user.role === ROLES.MANAGER);
  
  const [jobPost, setJobPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobPost = async () => {
      try {
        const response = await api.get(`/company/jobposts/${jobPostId}`);
        console.log('Job Post Data:', response.data);
        setJobPost(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching job post:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    if (jobPostId) {
      fetchJobPost();
    }
  }, [jobPostId]);

  const handleDelete = async () => {
    if (window.confirm('이 공고를 삭제하시겠습니까?')) {
      try {
        await api.delete(`/company/jobposts/${jobPostId}`);
        alert('공고가 삭제되었습니다.');
        navigate(-1);
      } catch (err) {
        console.error('Error deleting job post:', err);
        alert('공고 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/editpost/${jobPostId}`);
  };

  const settingsButton = getDefaultSettingsButton({
    onEdit: handleEdit,
    onDelete: handleDelete,
    isVisible: isAdminOrManager
  });

  if (loading) {
    return (
      <>
        <ViewPostSidebar jobPost={null} />
        <Layout title="로딩 중...">
          <div className="flex justify-center items-center h-screen">
            <div className="text-xl">로딩 중...</div>
          </div>
        </Layout>
      </>
    );
  }

  if (error) {
    return (
      <>
        <ViewPostSidebar jobPost={null} />
        <Layout title="오류">
          <div className="flex justify-center items-center h-screen">
            <div className="text-xl text-red-500">{error}</div>
          </div>
        </Layout>
      </>
    );
  }

  if (!jobPost) {
    return (
      <>
        <ViewPostSidebar jobPost={null} />
        <Layout title="공고 없음">
          <div className="flex justify-center items-center h-screen">
            <div className="text-xl">존재하지 않는 공고입니다.</div>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <ViewPostSidebar jobPost={jobPost} />
      <Layout title="채용공고 상세보기" settingsButton={settingsButton}>
        <div className="min-h-screen bg-[#eef6ff] dark:bg-gray-900 p-6 mx-auto max-w-screen-xl" style={{ marginLeft: 90 }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4 text-center space-y-2">
                <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-300 dark:border-gray-600 pb-2 dark:text-white">{jobPost.companyName}</h2>
                <p className="text-md text-gray-900 dark:text-gray-300">{jobPost.title}</p>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 ml-4 pb-2 dark:text-white">지원자격</h4>
                  <div className="text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-2 px-4 whitespace-pre-wrap">{jobPost.qualifications}</div>
                </div>
                <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 ml-4 pb-2 dark:text-white">근무조건</h4>
                  <div className="text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-2 px-4 whitespace-pre-wrap">{jobPost.conditions}</div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">모집분야 및 자격요건</h4>
                <div className="text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-2 px-4 whitespace-pre-wrap">{jobPost.jobDetails}</div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">전형절차</h4>
                <div className="text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-2 px-4 whitespace-pre-wrap">{jobPost.procedures}</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4 text-gray-900 dark:text-white">
                <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">모집 인원, 기간 설정</h4>
                <div className="border-t border-gray-300 dark:border-gray-600 p-4 pt-2">
                  <p><strong>모집 인원:</strong> {jobPost.headcount}명</p>
                  <p><strong>기간:</strong> {jobPost.startDate} ~ {jobPost.endDate}</p>
                </div>
              </div>

              {jobPost.teamMembers && (
                <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4 text-gray-900 dark:text-white">
                  <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">채용팀 편성</h4>
                  <div className="border-t border-gray-300 dark:border-gray-600 px-4 pt-3 space-y-3">
                    {jobPost.teamMembers.map((member, idx) => (
                      <p key={idx} className="text-gray-900 dark:text-white">• {member.email} ({member.role})</p>
                    ))}
                  </div>
                </div>
              )}

              {jobPost.weights && (
                <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4 text-gray-900 dark:text-white">
                  <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">가중치 항목</h4>
                  <div className="border-t border-gray-300 dark:border-gray-600 px-4 pt-3 space-y-3">
                    {jobPost.weights.map((w, idx) => (
                      <p key={idx} className="text-gray-900 dark:text-white">• {w.item}: {w.score}점</p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-center mt-10">
            <button
              onClick={() => navigate(`/applicantlist/${jobPostId}`)}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded text-lg"
            >
              지원자 조회
            </button>
          </div>
        </div>
      </Layout>
    </>
  );
}

export default ViewPost;
