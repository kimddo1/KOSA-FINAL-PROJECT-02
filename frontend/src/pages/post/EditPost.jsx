import React, { useState, useRef, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/datepicker.css";
import Layout from '../../layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api';

const useAutoResize = (value) => {
  const textareaRef = useRef(null);

  const autoResizeTextarea = (element) => {
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      autoResizeTextarea(textareaRef.current);
    }
  }, [value]);

  return textareaRef;
};

function EditPost() {
  const navigate = useNavigate();
  const { jobPostId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Initialize state with empty values
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [conditions, setConditions] = useState('');
  const [job_details, setJobDetails] = useState('');
  const [procedures, setProcedures] = useState('');
  const [headcount, setHeadcount] = useState('');
  const [period, setPeriod] = useState({
    start: new Date(),
    end: new Date()
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [weights, setWeights] = useState([]);

  // Fetch job post data
  useEffect(() => {
    const fetchJobPost = async () => {
      try {
        const response = await api.get(`/company/jobposts/${jobPostId}`);
        const jobPost = response.data;
        
        // Pre-populate all form fields with fetched data
        setTitle(jobPost.companyName);
        setSubtitle(jobPost.title);
        setQualifications(jobPost.qualifications);
        setConditions(jobPost.conditions);
        setJobDetails(jobPost.job_details);
        setProcedures(jobPost.procedures);
        setHeadcount(jobPost.headcount);
        setPeriod({
                  start: new Date(jobPost.start_date),
        end: new Date(jobPost.end_date)
        });
        setTeamMembers(jobPost.teamMembers || []);
        setWeights(jobPost.weights || []);
        
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

  const roleOptions = ['관리자', '멤버'];
  const scoreOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toString());

  const handleAdd = (setter, defaultItem) => setter(prev => [...prev, defaultItem]);
  const handleRemove = (setter, index) => setter(prev => prev.filter((_, i) => i !== index));
  const handleChange = (setter, index, field, value) => {
    setter(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: value
      };
      return updated;
    });
  };

  const qualificationsRef = useAutoResize(qualifications);
  const conditionsRef = useAutoResize(conditions);
  const jobDetailsRef = useAutoResize(jobDetails);
  const proceduresRef = useAutoResize(procedures);

  const handleTextareaChange = (e, setter) => {
    setter(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
              await api.put(`/company/jobposts/${jobPostId}`, {
        companyName: title,
        title: subtitle,
        qualifications,
        conditions,
        job_details,
        procedures,
        headcount,
        start_date: period.start.toISOString().split('T')[0],
        end_date: period.end.toISOString().split('T')[0],
        teamMembers,
        weights
      });
      alert("수정이 완료되었습니다!");
      navigate(-1);
    } catch (err) {
      console.error('Error updating job post:', err);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <Layout title="로딩 중...">
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="오류">
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl text-red-500">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="채용공고 수정">
      <div className="min-h-screen bg-[#eef6ff] dark:bg-gray-900 p-6 mx-auto max-w-screen-xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4 text-center space-y-2">
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="text-2xl font-semibold w-full text-center bg-transparent outline-none text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2" placeholder="회사명" />
                <input type="text" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} className="text-md w-full text-center bg-transparent outline-none text-gray-900 dark:text-gray-300" placeholder="채용공고 제목" />
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 ml-4 pb-2 dark:text-white">지원자격</h4>
                  <textarea 
                    ref={qualificationsRef}
                    value={qualifications} 
                    onChange={(e) => handleTextareaChange(e, setQualifications)} 
                    className="w-full min-h-[100px] overflow-hidden resize-none p-4 rounded outline-none border-t border-gray-300 dark:border-gray-600 pt-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                    placeholder="경력, 학력, 스킬, 우대사항 등" 
                  />
                </div>
                <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 ml-4 pb-2 dark:text-white">근무조건</h4>
                  <textarea 
                    ref={conditionsRef}
                    value={conditions} 
                    onChange={(e) => handleTextareaChange(e, setConditions)} 
                    className="w-full min-h-[100px] overflow-hidden resize-none p-4 rounded outline-none border-t border-gray-300 dark:border-gray-600 pt-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                    placeholder="고용형태, 급여, 지역, 시간, 직책 등" 
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">모집분야 및 자격요건</h4>
                <textarea 
                  ref={jobDetailsRef}
                  value={job_details} 
                  onChange={(e) => handleTextareaChange(e, setJobDetails)} 
                  className="w-full min-h-[100px] overflow-hidden resize-none p-4 rounded outline-none border-t border-gray-300 dark:border-gray-600 pt-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  placeholder="담당업무, 자격요건, 우대사항 등" 
                />
              </div>

              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">전형절차</h4>
                <textarea 
                  ref={proceduresRef}
                  value={procedures} 
                  onChange={(e) => handleTextareaChange(e, setProcedures)} 
                  className="w-full min-h-[100px] overflow-hidden resize-none rounded p-4 outline-none border-t border-gray-300 dark:border-gray-600 pt-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" 
                  placeholder="예: 서류 → 면접 → 합격" 
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4 text-gray-900 dark:text-white">
                <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">모집 인원, 기간 설정</h4>
                <div className="border-t border-gray-300 dark:border-gray-600 px-4 pt-3 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <label className="w-24 text-sm text-gray-700 dark:text-gray-200">모집 인원:</label>
                    <input 
                      type="text" 
                      value={headcount} 
                      onChange={(e) => setHeadcount(e.target.value)} 
                      className="border border-gray-400 dark:border-gray-600 focus:border-gray-300 dark:focus:border-gray-300 px-2 py-1 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" 
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-sm text-gray-700 dark:text-white">기간:</label>
                    <DatePicker 
                      selected={period.start} 
                      onChange={(date) => setPeriod({ ...period, start: date })} 
                      selectsStart 
                      startDate={period.start} 
                      endDate={period.end} 
                      dateFormat="yyyy/MM/dd" 
                      className="w-32 border border-gray-400 dark:border-gray-600 focus:border-gray-300 dark:focus:border-gray-300 px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-colors" 
                      placeholderText="시작일" 
                      calendarClassName="dark:bg-gray-800 dark:text-white" 
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">~</span>
                    <DatePicker 
                      selected={period.end} 
                      onChange={(date) => setPeriod({ ...period, end: date })} 
                      selectsEnd 
                      startDate={period.start} 
                      endDate={period.end} 
                      minDate={period.start} 
                      dateFormat="yyyy/MM/dd" 
                      className="w-32 border border-gray-400 dark:border-gray-600 focus:border-gray-300 dark:focus:border-gray-300 px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-colors" 
                      placeholderText="종료일" 
                      calendarClassName="dark:bg-gray-800 dark:text-white" 
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4 text-gray-900 dark:text-white">
                <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">채용팀 편성</h4>
                <div className="border-t border-gray-300 dark:border-gray-600 px-4 pt-3 space-y-3">
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <input type="email" value={member.email} onChange={(e) => handleChange(setTeamMembers, idx, 'email', e.target.value)} className="flex-1 border border-gray-400 dark:border-gray-600 focus:border-gray-300 dark:focus:border-gray-300 px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" />
                      <select value={member.role} onChange={(e) => handleChange(setTeamMembers, idx, 'role', e.target.value)} className="w-32 border border-gray-400 dark:border-gray-600 focus:border-gray-300 dark:focus:border-gray-300 px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors">
                        <option value="">권한 선택</option>
                        {roleOptions.map((role) => <option key={role}>{role}</option>)}
                      </select>
                      <button type="button" onClick={() => handleRemove(setTeamMembers, idx)} className="text-red-500 text-xl font-bold">×</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => handleAdd(setTeamMembers, { email: '', role: '' })} className="text-sm text-blue-600 hover:underline ml-4 mt-3">+ 멤버 추가</button>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4 text-gray-900 dark:text-white">
                <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">가중치 항목</h4>
                <div className="border-t border-gray-300 dark:border-gray-600 px-4 pt-3 space-y-3">
                  {weights.map((weight, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <input type="text" value={weight.item} onChange={(e) => handleChange(setWeights, idx, 'item', e.target.value)} className="flex-1 border border-gray-400 dark:border-gray-600 focus:border-gray-300 dark:focus:border-gray-300 px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors" />
                      <select value={weight.score} onChange={(e) => handleChange(setWeights, idx, 'score', e.target.value)} className="w-24 border border-gray-400 dark:border-gray-600 focus:border-gray-300 dark:focus:border-gray-300 px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors">
                        <option value="">점수</option>
                        {scoreOptions.map(score => <option key={score}>{score}</option>)}
                      </select>
                      <button type="button" onClick={() => handleRemove(setWeights, idx)} className="text-red-500 text-xl font-bold">×</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={() => handleAdd(setWeights, { item: '', score: '' })} className="text-sm text-blue-600 hover:underline ml-4 mt-3">+ 항목 추가</button>
              </div>
            </div>
          </div>

          {/* 하단 버튼 */}
          <div className="flex justify-center mt-10">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded text-lg">
              수정 완료
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default EditPost;
