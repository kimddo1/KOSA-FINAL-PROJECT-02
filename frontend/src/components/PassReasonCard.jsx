import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaStar, FaRegStar, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import api from '../api/api';

function generateQuestions(resume) {
  if (!resume) return [];
  const questions = [];
  if (resume.skills && resume.skills.length > 0) {
    questions.push(`보유 기술(${Array.isArray(resume.skills) ? resume.skills.join(', ') : resume.skills}) 중 가장 자신 있는 기술과 그 이유를 말씀해 주세요.`);
  }
  if (resume.experience && resume.experience.length > 0) {
    questions.push('경력 사항 중 가장 기억에 남는 프로젝트/업무 경험을 구체적으로 설명해 주세요.');
  }
  if (resume.certifications && resume.certifications.length > 0) {
    questions.push('보유 자격증이 실제 업무에 어떻게 도움이 되었는지 예시를 들어 설명해 주세요.');
  }
  if (resume.content && resume.content.length > 0) {
    questions.push('자기소개서에서 강조한 강점이 실제로 발휘된 사례를 말씀해 주세요.');
  }
  if (questions.length === 0) {
    questions.push('이력서 기반 맞춤 질문이 없습니다.');
  }
  return questions;
}

const PassReasonCard = ({ applicant, onBack, onStatusChange }) => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(applicant?.isBookmarked === 'Y');
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    const fetchResume = async () => {
      if (!applicant?.resumeId) {
        setLoading(false);
        return;
      }
      try {
        const response = await api.get(`/resumes/${applicant.resumeId}`);
        setResume(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching resume:', error);
        setLoading(false);
      }
    };
    fetchResume();
  }, [applicant]);


  useEffect(() => {
    const fetchAIReason = async () => {
      if (!applicant?.resumeId) return;
      try {
        const res = await api.get(`/ai/pass-reason/${applicant.resumeId}`);
        setAutoPassReason(res.data.passReason);
      } catch (e) {
        console.error("AI 합격 사유 불러오기 실패", e);
      }
    };
    fetchAIReason();
  }, [applicant]);
  





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

  const handleBookmarkToggle = async () => {
    try {
      const newBookmarkStatus = !isBookmarked;
      await api.put(`/applications/${applicant.id}/bookmark`, {
        isBookmarked: newBookmarkStatus ? 'Y' : 'N'
      });
      setIsBookmarked(newBookmarkStatus);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleReject = async () => {
    if (!window.confirm('정말로 이 지원자를 서류 불합격 처리하시겠습니까?')) return;
    setRejecting(true);
    try {
      await api.put(`/applications/${applicant.id}/status`, { status: 'REJECTED' });
      alert('서류 불합격 처리되었습니다.');
      if (onStatusChange) onStatusChange('REJECTED');
      onBack();
    } catch (error) {
      alert('불합격 처리에 실패했습니다.');
      setRejecting(false);
    }
  };

  const handlePass = async () => {
    if (!window.confirm('정말로 이 지원자를 서류 합격 처리하시겠습니까?')) return;
    setRejecting(true);
    try {
      await api.put(`/applications/${applicant.id}/status`, { status: 'PASSED' });
      alert('서류 합격 처리되었습니다.');
      if (onStatusChange) onStatusChange('PASSED');
      onBack();
    } catch (error) {
      alert('합격 처리에 실패했습니다.');
      setRejecting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

  const questions = generateQuestions(resume);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <FaArrowLeft />
          <span>목록으로</span>
        </button>
        <button
          onClick={handleBookmarkToggle}
          className="text-2xl"
        >
          {isBookmarked ? (
            <FaStar className="text-yellow-400" />
          ) : (
            <FaRegStar className="text-gray-400" />
          )}
        </button>
      </div>

      {/* Applicant Basic Info */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center">
            <i className="fa-solid fa-user text-white text-2xl" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {applicant?.name} ({calculateAge(applicant?.birthDate)}세)
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {applicant?.applicationSource || 'DIRECT'} 지원
            </p>
          </div>
        </div>
        {/* Contact Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FaEnvelope />
            <span>{applicant?.email || 'N/A'}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
            <FaPhone />
            <span>{applicant?.phone || 'N/A'}</span>
          </div>
        </div>
        {/* Application Date */}
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <FaCalendarAlt />
          <span>지원일: {new Date(applicant?.appliedAt).toLocaleDateString()}</span>
        </div>
      </div>

      {/* 이력서 기반 개인별 질문 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">이력서 기반 개인별 질문</h3>
        <ul className="list-disc pl-6 space-y-2">
          {questions.map((q, idx) => (
            <li key={idx} className="text-gray-700 dark:text-gray-300">{q}</li>
          ))}
        </ul>
      </div>

      {/* Resume Details */}
      {resume && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">이력서 정보</h3>
          <div className="space-y-3">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">학력</span>
              <p className="text-gray-800 dark:text-white">{resume.education || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">경력</span>
              <p className="text-gray-800 dark:text-white">{resume.experience || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">자격증</span>
              <p className="text-gray-800 dark:text-white">{resume.certifications || 'N/A'}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">기술스택</span>
              <p className="text-gray-800 dark:text-white">{resume.skills || 'N/A'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Pass/Reject Reason */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
          {applicant?.status === 'PASSED' ? '합격 사유' : '불합격 사유'}
        </h3>
        <div className={applicant?.status === 'PASSED' ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20" + " rounded-lg p-4"}>
          <p className="text-gray-700 dark:text-gray-300">
            {applicant?.status === 'PASSED'
              ? (applicant?.passReason || '서류 심사에서 우수한 성과를 보여 합격 처리되었습니다.')
              : (applicant?.failReason || '서류 심사 결과 불합격 처리되었습니다.')}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {applicant?.status === 'PASSED' ? (
          <button
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
            onClick={handleReject}
            disabled={rejecting}
          >
            {rejecting ? '처리 중...' : '서류 불합격 처리'}
          </button>
        ) : (
          <button
            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
            onClick={handlePass}
            disabled={rejecting}
          >
            {rejecting ? '처리 중...' : '서류 합격 처리'}
          </button>
        )}
      </div>
    </div>
  );
};

export default PassReasonCard; 