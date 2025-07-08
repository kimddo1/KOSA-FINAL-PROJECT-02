import React from 'react';
import ApplicantCard from '../../components/ApplicantCard';

function ApplicantListSimple({
  applicants = [],
  selectedApplicantIndex,
  onSelectApplicant,
  handleApplicantClick,
  handleCloseDetailedView,
  compact = false,
  splitMode = false,
  calculateAge,
}) {
  return (
    <div className="flex flex-col w-full h-full gap-2">
      {applicants.length > 0 ? (
        applicants.map((applicant, index) => (
          <ApplicantCard
            key={applicant.id}
            applicant={applicant}
            index={index + 1}
            isSelected={selectedApplicantIndex === index && splitMode}
            splitMode={splitMode}
            bookmarked={false}
            onClick={() => {
              const isCurrentCardSelected = selectedApplicantIndex === index && splitMode;
              if (splitMode && isCurrentCardSelected) {
                handleCloseDetailedView && handleCloseDetailedView();
              } else if (splitMode && !isCurrentCardSelected) {
                onSelectApplicant && onSelectApplicant(applicant, index);
              } else {
                handleApplicantClick && handleApplicantClick(applicant, index);
              }
            }}
            onBookmarkToggle={() => {}}
            calculateAge={calculateAge}
            compact={compact}
          />
        ))
      ) : (
        <div className="text-center text-gray-500 py-6 text-xs">지원자가 없습니다.</div>
      )}
    </div>
  );
}

export default ApplicantListSimple; 