import React, { useState, useEffect, useRef, useMemo } from 'react';
import ApplicantCard from '../../components/ApplicantCard';

function ApplicantListLeft({
  applicants = [],
  splitMode,
  selectedApplicantIndex,
  onSelectApplicant,
  handleApplicantClick,
  handleCloseDetailedView, 
  bookmarkedList = [],
  toggleBookmark,
  calculateAge,
  onFilteredApplicantsChange,
  compact = false,
}) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ type: 'score', isDesc: true });
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // filteredApplicants는 useMemo로 계산
  const filteredApplicants = useMemo(() => {
    let filtered = Array.isArray(applicants) ? [...applicants] : [];
    // 여러 상태 포함 필터 예시
    const allowedStatuses = ['WAITING', 'SUITABLE', 'UNSUITABLE', 'REJECTED', 'PASSED'];
    // const allowedStatuses = ['WAITING', 'SUITABLE', 'UNSUITABLE']  // 만약 모든 지원자(합격/불합격 포함) 다 보고 싶다면 이 필터를 제거!
    filtered = filtered.filter(app => allowedStatuses.includes((app.status || '').toUpperCase()));

    console.log('모든 지원자 status, score:', applicants.map(a => [a.status, a.score]));
    if (activeTab === 'EXCLUDED') {
      filtered = filtered.filter(app => app.score <= 20);
    } else if (activeTab === 'UNSUITABLE') {
      filtered = filtered.filter(app => app.score > 20 && app.score <= 60);
    } else if (activeTab === 'SUITABLE') {
      filtered = filtered.filter(app => app.score > 60);
    }
    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(app =>
        app.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (showBookmarkedOnly) {
      filtered = filtered.filter((_, index) => bookmarkedList[index]);
    }
    filtered.sort((a, b) => {
      if (sortConfig.type === 'score') {
        return sortConfig.isDesc ? b.score - a.score : a.score - b.score;
      } else {
        const dateA = new Date(a.appliedAt);
        const dateB = new Date(b.appliedAt);
        return sortConfig.isDesc ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
      }
    });
    return filtered;
  }, [
    applicants, activeTab, searchQuery, sortConfig,
    showBookmarkedOnly, bookmarkedList,
  ]);

  // 부모에게 변경 알림이 필요할 때만
  useEffect(() => {
    if (onFilteredApplicantsChange) {
      onFilteredApplicantsChange(filteredApplicants);
    }
    // filteredApplicants, onFilteredApplicantsChange만!
  }, [filteredApplicants, onFilteredApplicantsChange]);

  const getButtonStyle = (tab) => {
    const base = 'text-sm px-3 py-1 rounded shadow-sm border font-semibold transition transform duration-150';
    const isActive = activeTab === tab;
    switch (tab) {
      case 'ALL':
        return `${base} ${
          isActive
            ? 'bg-blue-500 text-white border-blue-500 font-bold scale-105'
            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
        }`;
      case 'SUITABLE':
        return `${base} ${
          isActive
            ? 'bg-blue-600 text-white border-blue-600 font-bold scale-105'
            : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'
        }`;
      case 'UNSUITABLE':
        return `${base} ${
          isActive
            ? 'bg-red-600 text-white border-red-600 font-bold scale-105'
            : 'bg-red-100 text-red-700 border-red-300 hover:bg-red-200'
        }`;
      case 'EXCLUDED':
        return `${base} ${
          isActive
            ? 'bg-gray-600 text-white border-gray-600 font-bold scale-105'
            : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
        }`;
      default:
        return base;
    }
  };

  return (
    <div className="flex flex-col w-full h-full p-2 overflow-y-auto">
      {/* 상단 필터/정렬 */}
      <div className="w-full max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-4 relative">
          {/* 검색창 */}
          <input
            type="text"
            placeholder="이름 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 px-2 py-1 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all mr-2 text-xs"
            style={{ minWidth: 100 }}
          />
          <div className="flex-1" />
          {/* 탭 필터 */}
          <div className="flex gap-1">
            <button onClick={() => setActiveTab('ALL')} className={getButtonStyle('ALL')}>전체</button>
            <button onClick={() => setActiveTab('SUITABLE')} className={getButtonStyle('SUITABLE')}>합격</button>
            <button onClick={() => setActiveTab('UNSUITABLE')} className={getButtonStyle('UNSUITABLE')}>불합격</button>
            <button onClick={() => setActiveTab('EXCLUDED')} className={getButtonStyle('EXCLUDED')}>제외</button>
          </div>
          {/* Vertical Ellipsis & Dropdown */}
          <div className="relative ml-2" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((open) => !open)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              aria-label="더보기"
            >
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="5" r="1.5" fill="currentColor" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                <circle cx="12" cy="19" r="1.5" fill="currentColor" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 p-3 flex flex-col gap-2">
                <button
                  onClick={() => setSortConfig(prev => ({ type: 'score', isDesc: !prev.isDesc }))}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
                    sortConfig.type === 'score'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  } border`}
                >
                  {sortConfig.type === 'score' ? (sortConfig.isDesc ? '점수↓' : '점수↑') : '점수'}
                </button>
                <button
                  onClick={() => setSortConfig(prev => ({ type: 'date', isDesc: !prev.isDesc }))}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-all ${
                    sortConfig.type === 'date'
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  } border`}
                >
                  {sortConfig.type === 'date' ? (sortConfig.isDesc ? '지원일↓' : '지원일↑') : '지원일'}
                </button>
                <button
                  onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-all border ${
                    showBookmarkedOnly 
                      ? 'bg-yellow-500 dark:bg-yellow-600 text-white border-yellow-500 dark:border-yellow-600' 
                      : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                  }`}
                >
                  북마크 {showBookmarkedOnly ? '✓' : ''}
                </button>
              </div>
            )}
          </div>
        </div>
        {/* 리스트 */}
        <div className="flex flex-col gap-2">
          {filteredApplicants.length > 0 ? (
            filteredApplicants.map((applicant, index) => {
              const globalIndex = applicants.findIndex((a) => a.id === applicant.id);
              return (
                <ApplicantCard
                  key={applicant.id}
                  applicant={applicant}
                  index={index + 1}
                  isSelected={selectedApplicantIndex === globalIndex && splitMode}
                  splitMode={splitMode}
                  bookmarked={bookmarkedList[globalIndex]}
                  onClick={() => {
                    const isCurrentCardSelected = selectedApplicantIndex === globalIndex && splitMode; 
                    if (splitMode && isCurrentCardSelected ) {
                      handleCloseDetailedView();
                    } else if (splitMode && !isCurrentCardSelected ) {
                      onSelectApplicant(applicant, globalIndex);
                    }
                    else {
                      handleApplicantClick(applicant, globalIndex);
                    }
                  }}
                  onBookmarkToggle={() => toggleBookmark(globalIndex)}
                  calculateAge={calculateAge}
                  compact={compact}
                />
              );
            })
          ) : (
            <div className="text-center text-gray-500 py-6 text-xs">지원자가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ApplicantListLeft;
