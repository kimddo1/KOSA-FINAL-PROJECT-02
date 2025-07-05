import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { IoArrowBack } from 'react-icons/io5';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../constants/roles';
import SettingsMenu, { getDefaultSettingsButton } from '../../components/SettingsMenu';
import ApplicantListLeft from './ApplicantListLeft';
import ResumeCard from '../../components/ResumeCard';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../api/api';

export default function ApplicantList() {
  const [bookmarkedList, setBookmarkedList] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedApplicantIndex, setSelectedApplicantIndex] = useState(null);
  const [splitMode, setSplitMode] = useState(false);
  const [applicants, setApplicants] = useState([]);
  const [filteredApplicants, setFilteredApplicants] = useState([]);
  const [resume, setResume] = useState(null);
  const [waitingApplicants, setWaitingApplicants] = useState([]);
  const [passedCount, setPassedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [headcount, setHeadcount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const isAdminOrManager = user && (user.role === ROLES.ADMIN || user.role === ROLES.MANAGER);
  const navigate = useNavigate();
  const { jobPostId } = useParams();
  const [expanded, setExpanded] = useState(null);
  
  // jobPostId가 없으면 기본값 사용
  const effectiveJobPostId = jobPostId;

  const toggleExpand = (applicantId) => {
    setExpanded(expanded === applicantId ? null : applicantId);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [appRes, postRes, appDetailRes] = await Promise.all([
        api.get(`/applications/job/${effectiveJobPostId}/applicants`),
        api.get(`/company/jobposts/${effectiveJobPostId}`)
        ]);
        const applicants = appRes.data;
        setApplicants(applicants);
        setWaitingApplicants(applicants.filter(app => app.status === 'WAITING'));
        setPassedCount(applicants.filter(app => app.status === 'PASSED').length);
        setRejectedCount(applicants.filter(app => app.status === 'REJECTED').length);
        setBookmarkedList(applicants.map(app => app.isBookmarked === 'Y'));
        setHeadcount(postRes.data?.headcount ?? 0);
      } catch (err) {
        console.error('지원자/공고 데이터 불러오기 실패:', err);
        setError('지원자 또는 공고 정보를 불러올 수 없습니다.');
      } finally {
        setLoading(false);
      }
    };

    if (effectiveJobPostId) fetchData();
  }, [effectiveJobPostId]);

  const handleDelete = async () => {
    if (window.confirm('이 지원자를 삭제하시겠습니까?')) {
      try {
        await api.delete(`/applications/${selectedApplicant.id}`);
        alert('지원자가 삭제되었습니다.');
        navigate(-1);
      } catch (err) {
        console.error('Error deleting applicant:', err);
        alert('지원자 삭제 중 오류가 발생했습니다.');
      }
    }
  };

  const handleEdit = () => {
    navigate(`/editpost/${effectiveJobPostId}`);
  };

  const settingsButton = getDefaultSettingsButton({
    onEdit: handleEdit,
    onDelete: handleDelete,
    isVisible: isAdminOrManager
  });

  const toggleBookmark = async (index) => {
    try {
      const applicant = applicants[index];
      const newBookmarkStatus = bookmarkedList[index] ? 'N' : 'Y';

      await api.patch(`/applications/${applicant.id}/bookmark`, {
        isBookmarked: newBookmarkStatus
      });

      const updated = [...bookmarkedList];
      updated[index] = !updated[index];
      setBookmarkedList(updated);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
      alert('즐겨찾기 상태 변경 중 오류가 발생했습니다.');
    }
  };

  const handleSkip = () => {
    if (selectedApplicantIndex === null || filteredApplicants.length === 0) return;
    
    const currentFilteredIndex = filteredApplicants.findIndex(
      app => app.id === applicants[selectedApplicantIndex].id
    );
    
    const nextFilteredIndex = (currentFilteredIndex + 1) % filteredApplicants.length;
    const nextApplicant = filteredApplicants[nextFilteredIndex];
    
    const nextGlobalIndex = applicants.findIndex(app => app.id === nextApplicant.id);
    
    handleApplicantClick(nextApplicant, nextGlobalIndex);
  };

  // 지원자 클릭 시 실행되는 함수 （ 이력서 상세 보기－ 열림 ）
  const handleApplicantClick = async (applicant, index) => {
    setSelectedApplicantIndex(index);
    setResume(null);
    try {
      console.log("지원서 상세 요청 - applicationId:", applicant.id);
      const res = await api.get(`/applications/${applicant.id}`);
      console.log("지원서 상세 응답:", res.data);
      setResume(res.data); // 혹은 setResume(res.data) 구조에 따라

      console.log("res.data", res.data);

      setSelectedApplicant(applicant);
      setSplitMode(true);
    } catch (err) {
      console.error("지원서 상세 불러오기 실패:", err.response?.data || err.message);
      console.error("에러 상태:", err.response?.status);
      console.error("전체 에러:", err);
    }
  };

  // 지원서가 열렸을 때, 상세 페이지 닫는 함수
  const handleCloseDetailedView = () => {
    console.log("상세 페이지 닫기 호출됨");
    setSplitMode(false);             // splitMode를 false
    setSelectedApplicant(null);      // 선택된 지원자 정보 초기화
    setResume(null);                 // 이력서 정보 초기화
    setSelectedApplicantIndex(null); // 선택된 인덱스 초기화 (선택 표시 해제)
  };


  const handleBack = () => {
    setSplitMode(false);
    setSelectedApplicantIndex(null);
  };

  // const selectedApplicant = selectedApplicantIndex !== null ? applicants[selectedApplicantIndex] : null;

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

  if (loading) {
    return (
      <Layout settingsButton={settingsButton}>
        <div className="h-screen flex items-center justify-center">
          <div className="text-xl">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout settingsButton={settingsButton}>
        <div className="h-screen flex items-center justify-center">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout settingsButton={settingsButton}>
      <div className="h-screen flex flex-col">
        <div className="bg-white dark:bg-gray-800 shadow px-8 py-4 flex items-center justify-center">
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            보안SW 개발자 신입/경력사원 모집 (<span className="text-blue-700 dark:text-blue-400">C, C++</span>) - 소프트웨어 개발자
          </div>
        </div>

        <div className="flex-1 flex gap-6 p-6 overflow-hidden">
          <div 
            className={`transition-[width] duration-500 ease-in-out ${splitMode ? 'w-[40%]' : 'w-[60%]'}`}
            style={{ minWidth: splitMode ? 320 : undefined }}
          >
            <ApplicantListLeft
              applicants={applicants}
              splitMode={splitMode}
              selectedApplicantIndex={selectedApplicantIndex}
              onSelectApplicant={handleApplicantClick}
              handleApplicantClick={handleApplicantClick}
              handleCloseDetailedView={handleCloseDetailedView}
              bookmarkedList={bookmarkedList}
              toggleBookmark={toggleBookmark}
              calculateAge={calculateAge}
              onFilteredApplicantsChange={setFilteredApplicants}
            />
          </div>

          <div
            className={`flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow transition-all duration-500 ease-in-out`}
            style={{ minWidth: 400 }}
          >
            {splitMode && selectedApplicant ? (
              <div className="h-full flex flex-col">
                <div className="h-16 bg-white dark:bg-gray-800 border-b flex items-center px-4">
                  <button 
                    onClick={handleBack}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <IoArrowBack className="text-2xl text-gray-600 dark:text-gray-300" />
                  </button>
                </div>
                {/*여기를 이력서로*/}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <ResumeCard resume={resume} onClick={handleApplicantClick}/>
                </div>

                <div className="p-4 border-t bg-white dark:bg-gray-800">
                  {/* 합격/불합격/건너뛰기 버튼 */}
                  <div className="flex justify-between items-center gap-4">
                    <button className="flex-1 py-3 rounded-full border-2 border-blue-400 text-blue-500 font-bold text-lg bg-white hover:bg-blue-50 transition">합격</button>
                    <button className="flex-1 py-3 rounded-full border-2 border-gray-400 text-gray-700 font-bold text-lg bg-white hover:bg-gray-50 transition" onClick={handleSkip}>건너뛰기</button>
                    <button className="flex-1 py-3 rounded-full border-2 border-red-400 text-red-500 font-bold text-lg bg-white hover:bg-red-50 transition">불합격</button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                  <div className="flex flex-col items-center justify-center p-8">
                    <div className="text-center space-y-8">
                      <div className="text-4xl font-bold text-blue-600">오늘의 신규 지원자</div>
                      <div className="text-6xl font-bold text-gray-800 dark:text-white">
                        {waitingApplicants.filter(a => new Date(a.appliedAt).toDateString() === new Date().toDateString()).length}
                      </div>
                      <div className="text-2xl font-semibold text-gray-600 dark:text-gray-300">대기중인 지원자</div>
                      <div className="text-5xl font-bold text-gray-800 dark:text-white">{waitingApplicants.length}</div>
                      <div className="text-2xl font-semibold text-gray-600 dark:text-gray-300">미열람 지원자</div>
                      <div className="text-5xl font-bold text-gray-800 dark:text-white">{waitingApplicants.filter(a => !a.isViewed).length}</div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t bg-white dark:bg-gray-800">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => navigate(`/passedapplicants/${effectiveJobPostId}`)}
                      className="w-40 border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-600 hover:text-white px-3 py-3 rounded-lg font-bold text-base shadow transition"
                    >
                      서류 합격자 명단 ({passedCount}/{headcount})
                    </button>
                    <button
                      onClick={() => navigate(`/rejectedapplicants/${effectiveJobPostId}`)}
                      className="w-40 border border-red-600 text-red-600 bg-transparent hover:bg-red-600 hover:text-white px-1 py-3 rounded-lg font-bold text-base shadow transition"
                    >
                      서류 불합격자 명단 {rejectedCount}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
