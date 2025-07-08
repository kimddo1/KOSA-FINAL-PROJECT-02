import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, VStack, Button, useColorModeValue, Tooltip, Text, Icon } from '@chakra-ui/react';
import { CiSettings, CiUser, CiCalendar } from 'react-icons/ci';
import { MdOutlinePlayCircle, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';

export default function ViewPostSidebar({ jobPost }) {
  const navigate = useNavigate();
  const { jobPostId: urlJobPostId } = useParams();
  const [isHovered, setIsHovered] = useState(false);
  const headerHeight = 64;
  const effectiveJobPostId = urlJobPostId || jobPost?.id;
  const interviewReportDone = jobPost?.interviewReportDone;
  const finalReportDone = jobPost?.finalReportDone;
  if (!jobPost) return null;

  return (
    <div
      className="fixed left-0 top-[64px] dark:bg-gray-800 dark:text-gray-100 bg-white text-gray-900 flex flex-col items-center pt-4 transition-all"
      style={{ zIndex: 9999, width: isHovered ? 180 : 90, height: `calc(100vh - ${headerHeight}px)`, borderRight: '1px solid #e2e8f0' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 공고 정보 */}
      <div className="w-full mb-4 px-1">
        <div className="font-bold text-md dark:text-gray-100 mb-1 truncate">{jobPost?.title || '공고 제목'}</div>
        <div className="text-xs text-gray-400 dark:text-gray-400 truncate">{jobPost?.startDate} ~ {jobPost?.endDate}</div>
      </div>
      {/* 네비게이션 버튼 */}
      <div className="flex flex-col gap-2 w-full mb-6">
        <button
          className={`flex items-center w-full h-11 rounded-md px-2 transition text-sm font-semibold
            ${isHovered ? 'justify-start' : 'justify-center'}
            bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600`}
          onClick={() => navigate(`/applicantlist/${effectiveJobPostId}`)}
        >
          <CiUser size={22} />
          {isHovered && <span className="ml-2">지원자 조회</span>}
        </button>
        <button
          className={`flex items-center w-full h-11 rounded-md px-2 transition text-sm font-semibold
            ${isHovered ? 'justify-start' : 'justify-center'}
            bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600`}
          onClick={() => navigate(`/passedapplicants/${effectiveJobPostId}`)}
        >
          <MdCheckCircle size={22} />
          {isHovered && <span className="ml-2">서류 합격자 명단</span>}
        </button>
        <button
          className={`flex items-center w-full h-11 rounded-md px-2 transition text-sm font-bold
            ${isHovered ? 'justify-start' : 'justify-center'}
            bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-800`}
          onClick={() => navigate(`/interview-progress/${effectiveJobPostId}`)}
        >
          <MdOutlinePlayCircle size={22} />
          {isHovered && <span className="ml-2">면접 진행</span>}
        </button>
      </div>
      {/* 보고서 버튼들 */}
      <div className="flex flex-col gap-1 w-full mb-6">
        <button
          className={`flex items-center w-full h-9 rounded-md px-2 transition text-sm
            ${isHovered ? 'justify-start' : 'justify-center'}
            ${interviewReportDone ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}
            ${interviewReportDone ? 'hover:bg-blue-200 dark:hover:bg-blue-800' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}
            ${!interviewReportDone ? 'opacity-60 cursor-not-allowed' : ''}`}
          onClick={() => interviewReportDone && navigate('/interview-report')}
          disabled={!interviewReportDone}
        >
          {interviewReportDone ? <MdCheckCircle size={18} /> : <MdRadioButtonUnchecked size={18} />}
          {isHovered && <span className="ml-2 text-sm">면접 보고서</span>}
        </button>
        <button
          className={`flex items-center w-full h-9 rounded-md px-2 transition text-sm
            ${isHovered ? 'justify-start' : 'justify-center'}
            ${finalReportDone ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500'}
            ${finalReportDone ? 'hover:bg-blue-200 dark:hover:bg-blue-800' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}
            ${!finalReportDone ? 'opacity-60 cursor-not-allowed' : ''}`}
          onClick={() => finalReportDone && navigate('/final-report')}
          disabled={!finalReportDone}
        >
          {finalReportDone ? <MdCheckCircle size={18} /> : <MdRadioButtonUnchecked size={18} />}
          {isHovered && <span className="ml-2 text-sm">최종 보고서</span>}
        </button>
      </div>
      {/* 하단 네비게이션 */}
      <div className="flex flex-col gap-2 w-full mb-4">
        <button
          className={`flex items-center w-full h-10 rounded-md px-2 transition text-sm
            ${isHovered ? 'justify-start' : 'justify-center'}
            bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600`}
          onClick={() => navigate('/memberschedule')}
        >
          <CiCalendar size={22} />
          {isHovered && <span className="ml-2">면접 응답</span>}
        </button>
        <button
          className={`flex items-center w-full h-10 rounded-md px-2 transition text-sm
            ${isHovered ? 'justify-start' : 'justify-center'}
            bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600`}
          onClick={() => navigate('/settings')}
        >
          <CiSettings size={22} />
          {isHovered && <span className="ml-2">설정</span>}
        </button>
        <button
          className={`flex items-center w-full h-10 rounded-md px-2 transition text-sm
            ${isHovered ? 'justify-start' : 'justify-center'}
            bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600`}
          onClick={() => navigate('/mypage')}
        >
          <CiUser size={22} />
          {isHovered && <span className="ml-2">내 정보</span>}
        </button>
      </div>
    </div>
  );
} 