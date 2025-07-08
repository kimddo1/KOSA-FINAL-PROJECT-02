import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaStar, FaRegStar, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import api from '../api/api';

const PassReasonCard = ({ applicant, onBack }) => {
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(applicant?.isBookmarked === 'Y');

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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 h-full">
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">로딩 중...</div>
        </div>
      </div>
    );
  }

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

      {/* Score Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">평가 점수</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">총점</span>
            <span className="text-2xl font-bold text-blue-600">{applicant?.score || 0}점</span>
          </div>
        </div>
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

      {/* Pass Reason */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">합격 사유</h3>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-gray-700 dark:text-gray-300">
            {applicant?.passReason || '서류 심사에서 우수한 성과를 보여 합격 처리되었습니다.'}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">
          상세보기
        </button>
        <button className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors">
          면접 일정
        </button>
      </div>
    </div>
  );
};

export default PassReasonCard; 