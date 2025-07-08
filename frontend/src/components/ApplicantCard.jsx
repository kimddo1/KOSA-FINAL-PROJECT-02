// src/components/ApplicantCard.jsx
import React from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';


// const calculateAge = (birthDate) => {
//     if (!birthDate) return 'N/A';
//     const today = new Date();
//     const birth = new Date(birthDate);
//     let age = today.getFullYear() - birth.getFullYear();
//     const monthDiff = today.getMonth() - birth.getMonth();
    
//     if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
//       age--;
//     }
    
//     return age;
//   };


const ApplicantCard = ({
  applicant,
  index,
  isSelected,
  splitMode,
  bookmarked,
  onClick,
  onBookmarkToggle,
  calculateAge,
  compact = false,
}) => {
  return (
    <div
      className={`transition-all duration-300 ease-in-out ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 m-1' : ''} ${compact ? 'p-1' : ''}`}
      style={{ borderRadius: '1.5rem', fontSize: compact ? '12px' : '16px' }}
    >
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 flex items-center gap-2 cursor-pointer transition-all duration-300 ease-in-out ${compact ? 'p-2' : 'p-4'}`}
        onClick={() => {
          onClick && onClick();
        }}
        style={{ boxSizing: 'border-box', minHeight: compact ? 56 : 80 }}
      >
        {/* 번호 */}
        <div className={`absolute top-1 left-2 text-xs font-bold text-blue-600 ${compact ? 'text-[10px]' : ''}`}>{index}</div>

        {/* 즐겨찾기 별 버튼 */}
        <button
          className={`absolute top-1 right-2 ${compact ? 'text-base' : 'text-xl'}`}
          onClick={e => {
            e.stopPropagation();
            onBookmarkToggle();
          }}
        >
          {bookmarked ? (
            <FaStar className="text-yellow-400" />
          ) : (
            <FaRegStar className="text-gray-400 hover:text-yellow-400" />
          )}
        </button>

        {/* 프로필 이미지 */}
        <div className={`flex items-center justify-center ${compact ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-gray-300`}>
          <i className="fa-solid fa-user text-white text-xl" />
        </div>

        {/* 중앙 텍스트 정보 */}
        <div className="flex flex-col flex-grow">
          <div className={`text-xs text-gray-500 dark:text-gray-400 text-right ${compact ? 'text-[10px]' : ''}`}>
            {new Date(applicant.appliedAt).toLocaleDateString()}
          </div>
          <div className={`font-semibold text-gray-800 dark:text-white ${compact ? 'text-xs' : 'text-lg'}`}>
            {applicant.name} ({calculateAge(applicant.birthDate)}세)
          </div>
          <div className={`text-gray-500 dark:text-gray-400 ${compact ? 'text-[11px]' : 'text-sm'}`}>
            {applicant.applicationSource || 'DIRECT'}
          </div>
        </div>

        {/* 점수 원 */}
        <div className={`flex items-center justify-center font-bold text-gray-800 dark:text-white border-2 border-blue-300 rounded-full ${compact ? 'w-10 h-10 text-xs' : 'w-16 h-16 text-sm'}`}>
          {applicant.score || 0}점
        </div>
      </div>
    </div>
  );
};

export default ApplicantCard;
