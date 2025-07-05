import React from 'react';

function JobCard({ job }) {
  return (
    <div className="card">
      <div className="card-body">
        <h5>{job.title}</h5>
        <p>{job.companyName || job.company}</p>
        <p>{job.location}</p>
      </div>
    </div>
  );
}

export default JobCard;