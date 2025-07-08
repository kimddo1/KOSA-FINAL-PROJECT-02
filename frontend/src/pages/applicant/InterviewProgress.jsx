import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import ViewPostSidebar from '../../components/ViewPostSidebar';
import ApplicantListSimple from './ApplicantListSimple';
import ResumeCard from '../../components/ResumeCard';
import InterviewPanel from './InterviewPanel';
import api from '../../api/api';

function InterviewProgress() {
  const { jobPostId } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [selectedApplicantIndex, setSelectedApplicantIndex] = useState(null);
  const [resume, setResume] = useState(null);
  const [questions, setQuestions] = useState([
    '자기소개를 해주세요.',
    '프로젝트 경험 중 가장 기억에 남는 것은?',
    '팀에서 맡았던 역할은 무엇인가요?'
  ]);
  const [memo, setMemo] = useState('');
  const [evaluation, setEvaluation] = useState({ 인성: '', 역량: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [jobPost, setJobPost] = useState(null);
  const [jobPostLoading, setJobPostLoading] = useState(true);

  // 좌측 width 드래그 조절 및 닫기/열기
  const [leftWidth, setLeftWidth] = useState(240);
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const isDragging = useRef(false);

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/applications/job/${jobPostId}/applicants`);
        setApplicants(res.data);
      } catch (err) {
        setError('지원자 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };
    if (jobPostId) fetchApplicants();
  }, [jobPostId]);

  useEffect(() => {
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
    if (jobPostId) fetchJobPost();
  }, [jobPostId]);

  // 드래그 핸들러
  const handleMouseDown = (e) => {
    isDragging.current = true;
    document.body.style.cursor = 'col-resize';
  };
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging.current || !isLeftOpen) return;
      const min = 160, max = 400;
      setLeftWidth(Math.max(min, Math.min(max, e.clientX - 90)));
    };
    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = '';
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isLeftOpen]);

  const handleApplicantClick = async (applicant, index) => {
    setSelectedApplicantIndex(index);
    setResume(null);
    try {
      const res = await api.get(`/applications/${applicant.id}`);
      setResume(res.data);
      setSelectedApplicant(applicant);
      setMemo('');
      setEvaluation({ 인성: '', 역량: '' });
    } catch (err) {
      setResume(null);
    }
  };

  const handleEvaluationChange = (item, level) => {
    setEvaluation(prev => ({ ...prev, [item]: level }));
  };

  if (loading || jobPostLoading) return <div className="flex h-screen items-center justify-center">로딩 중...</div>;
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;

  // 레이아웃: Navbar(상단), ViewPostSidebar(좌측), 나머지 flex
  return (
    <div className="relative min-h-screen bg-[#f7faff] dark:bg-gray-900">
      <Navbar />
      <ViewPostSidebar jobPost={jobPost} />
      <div className="flex flex-row" style={{ paddingTop: 64, marginLeft: 90, height: 'calc(100vh - 64px)' }}>
        {/* 좌측 지원자 리스트 */}
        <div
          className="border-r bg-white dark:bg-gray-800 h-full relative flex flex-col"
          style={{ width: isLeftOpen ? leftWidth : 16, minWidth: 16, maxWidth: 400, transition: 'width 0.1s' }}
        >
          {/* 닫기/열기 버튼 */}
          <button
            className="absolute top-2 right-2 z-30 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-full w-7 h-7 flex items-center justify-center shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            style={{ right: isLeftOpen ? '-18px' : '-18px', left: isLeftOpen ? 'auto' : '0', zIndex: 30 }}
            onClick={() => setIsLeftOpen(open => !open)}
          >
            {isLeftOpen ? '<<' : '>>'}
          </button>
          {/* 드래그 핸들러 */}
          {isLeftOpen && (
            <div className="absolute top-0 right-0 w-2 h-full cursor-col-resize z-20" onMouseDown={handleMouseDown} />
          )}
          {/* 지원자 목록 */}
          <div className="h-full overflow-y-auto pr-1 flex-1 flex flex-col">
            {isLeftOpen ? (
              <ApplicantListSimple
                applicants={applicants}
                splitMode={true}
                selectedApplicantIndex={selectedApplicantIndex}
                onSelectApplicant={handleApplicantClick}
                handleApplicantClick={handleApplicantClick}
                handleCloseDetailedView={() => {}}
                calculateAge={() => ''}
                compact={true}
                style={{ width: '100%', height: '100%' }}
              />
            ) : null}
          </div>
        </div>
        {/* 중앙 이력서 */}
        <div className="flex-1 flex flex-col h-full bg-[#f7faff] dark:bg-gray-900">
          <div className="flex-1 h-full overflow-y-auto flex flex-col items-stretch justify-start">
            {resume ? (
              <ResumeCard resume={resume} />
            ) : (
              <div className="text-gray-400 flex items-center justify-center h-full">지원자를 선택하세요</div>
            )}
          </div>
        </div>
        {/* 우측 면접 질문/메모 */}
        <div className="w-[400px] border-l bg-white dark:bg-gray-100 h-full">
          <div className="h-full overflow-y-auto">
            <InterviewPanel
              questions={questions}
              memo={memo}
              onMemoChange={setMemo}
              evaluation={evaluation}
              onEvaluationChange={handleEvaluationChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewProgress; 