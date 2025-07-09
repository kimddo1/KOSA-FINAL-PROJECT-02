import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../../styles/datepicker.css";
import { useAuth } from '../../context/AuthContext';
import Layout from '../../layout/Layout';
import TimePicker from '../../components/TimePicker';
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
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobPostId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    qualifications: '',
    conditions: '',
    job_details: '',
    procedures: '',
    headcount: '',
    start_date: null,
    end_date: null,
    location: '',
    employment_type: '',
    deadline: null,
    company: null
  });

  const [teamMembers, setTeamMembers] = useState([{ email: '', role: '' }]);
  const [schedules, setSchedules] = useState([{ date: null, time: '', place: '' }]);
  const [weights, setWeights] = useState([
    { item: '경력', score: '' },
    { item: '학력', score: '' },
    { item: '자격증', score: '' }
  ]);

  const roleOptions = ['관리자', '멤버'];
  const scoreOptions = Array.from({ length: 10 }, (_, i) => (i + 1).toString());
  const employmentTypeOptions = ['정규직', '계약직', '인턴', '프리랜서'];

  const qualificationsRef = useAutoResize(formData.qualifications);
  const conditionsRef = useAutoResize(formData.conditions);
  const jobDetailsRef = useAutoResize(formData.job_details);
  const proceduresRef = useAutoResize(formData.procedures);

  const handleTextareaChange = (e, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const handleInputChange = (e, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  // Fetch existing job post data
  useEffect(() => {
    const fetchJobPost = async () => {
      try {
        const response = await api.get(`/company/jobposts/${jobPostId}`);
        const jobPost = response.data;
        
        console.log('Job Post Data for editing:', jobPost);
        
        // Pre-populate form data
        setFormData({
          title: jobPost.title || '',
          department: jobPost.department || '',
          qualifications: jobPost.qualifications || '',
          conditions: jobPost.conditions || '',
          job_details: jobPost.job_details || '',
          procedures: jobPost.procedures || '',
          headcount: jobPost.headcount || '',
          start_date: jobPost.start_date ? new Date(jobPost.start_date) : null,
          end_date: jobPost.end_date ? new Date(jobPost.end_date) : null,
          location: jobPost.location || '',
          employment_type: jobPost.employment_type || '',
          deadline: jobPost.deadline ? new Date(jobPost.deadline) : null,
          company: jobPost.company || null
        });

        // Set team members, schedules, and weights
        setTeamMembers(jobPost.teamMembers || [{ email: '', role: '' }]);
        setSchedules(jobPost.schedules || [{ date: null, time: '', place: '' }]);
        setWeights(jobPost.weights || [
          { item: '경력', score: '' },
          { item: '학력', score: '' },
          { item: '자격증', score: '' }
        ]);
        
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

  // 입력 검증 함수
  const isFieldEmpty = (value) => value === null || value === undefined || value === '';
  const isTeamValid = teamMembers.length > 0 && teamMembers.every(m => m.email && m.role);
  const isScheduleValid = schedules.length > 0 && schedules.every(s => s.date && s.time && s.place);
  const isRecruitInfoValid = [formData.title, formData.department, formData.qualifications, formData.conditions, formData.job_details, formData.procedures, formData.headcount, formData.start_date, formData.end_date, formData.location, formData.employment_type].every(v => !isFieldEmpty(v));
  const isReady = isRecruitInfoValid && isTeamValid && isScheduleValid;
  const [showError, setShowError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isReady) {
      setShowError(true);
      return;
    }
    setShowError(false);
    
    try {
      // 날짜 형식 변환
      const formattedData = {
        ...formData,
        headcount: formData.headcount ? parseInt(formData.headcount) : null,
        start_date: formData.start_date ? formData.start_date.toISOString() : null,
        end_date: formData.end_date ? formData.end_date.toISOString() : null,
        deadline: formData.deadline ? formData.deadline.toISOString().split('T')[0] : null,
        teamMembers: teamMembers.filter(member => member.email && member.role),  // 빈 항목 제거
        weights: weights.filter(weight => weight.item && weight.score),  // 빈 항목 제거
        schedules: schedules.filter(schedule => schedule.date && schedule.time && schedule.place),  // 빈 항목 제거
      };

      console.log('Sending update data:', formattedData);

      const response = await api.put(`/company/jobposts/${jobPostId}`, formattedData);
      
      if (response.status === 200) {
        alert('채용공고가 수정되었습니다.');
        navigate(-1);
      }
    } catch (error) {
      console.error('Update failed:', error);
      console.error('Error response data:', error.response?.data);
      alert(error.response?.data?.detail?.[0]?.msg || error.response?.data?.message || '채용공고 수정에 실패했습니다.');
    }
  };

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
                <input 
                  type="text" 
                  value={formData.title} 
                  onChange={(e) => handleInputChange(e, 'title')} 
                  className={`text-2xl font-semibold w-full text-center bg-transparent outline-none text-gray-900 dark:text-white border-b border-gray-300 dark:border-gray-600 pb-2 ${showError && !formData.title ? 'border-b-2 border-red-500' : ''}`} 
                  placeholder="채용공고 제목" 
                />
                {showError && !formData.title && <div className="text-red-500 text-xs text-left">채용공고 제목을 입력하세요.</div>}
                <input 
                  type="text" 
                  value={formData.department} 
                  onChange={(e) => handleInputChange(e, 'department')} 
                  className={`text-md w-full text-center bg-transparent outline-none text-gray-900 dark:text-gray-300 ${showError && !formData.department ? 'border-b-2 border-red-500' : ''}`} 
                  placeholder="부서명 (예: 개발팀, 인사팀)" 
                />
                {showError && !formData.department && <div className="text-red-500 text-xs text-left">부서명을 입력하세요.</div>}
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 ml-4 pb-2 dark:text-white">지원자격</h4>
                  <textarea 
                    ref={qualificationsRef}
                    value={formData.qualifications} 
                    onChange={(e) => handleTextareaChange(e, 'qualifications')} 
                    className={`w-full min-h-[100px] overflow-hidden resize-none p-4 rounded outline-none border-t border-gray-300 dark:border-gray-600 pt-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${showError && !formData.qualifications ? 'border-2 border-red-500' : ''}`} 
                    placeholder="경력, 학력, 스킬, 우대사항 등" 
                  />
                  {showError && !formData.qualifications && <div className="text-red-500 text-xs text-left">지원자격을 입력하세요.</div>}
                </div>
                <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 ml-4 pb-2 dark:text-white">근무조건</h4>
                  <textarea 
                    ref={conditionsRef}
                    value={formData.conditions} 
                    onChange={(e) => handleTextareaChange(e, 'conditions')} 
                    className={`w-full min-h-[100px] overflow-hidden resize-none p-4 rounded outline-none border-t border-gray-300 dark:border-gray-600 pt-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${showError && !formData.conditions ? 'border-2 border-red-500' : ''}`} 
                    placeholder="고용형태, 급여, 지역, 시간, 직책 등" 
                  />
                  {showError && !formData.conditions && <div className="text-red-500 text-xs text-left">근무조건을 입력하세요.</div>}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">모집분야 및 자격요건</h4>
                <textarea 
                  ref={jobDetailsRef}
                  value={formData.job_details}
                  onChange={(e) => handleTextareaChange(e, 'job_details')} 
                  className={`w-full min-h-[100px] overflow-hidden resize-none p-4 rounded outline-none border-t border-gray-300 dark:border-gray-600 pt-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${showError && !formData.job_details ? 'border-2 border-red-500' : ''}`} 
                  placeholder="담당업무, 자격요건, 우대사항 등" 
                />
                {showError && !formData.job_details && <div className="text-red-500 text-xs text-left">모집분야 및 자격요건을 입력하세요.</div>}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">전형절차</h4>
                <textarea 
                  ref={proceduresRef}
                  value={formData.procedures} 
                  onChange={(e) => handleTextareaChange(e, 'procedures')} 
                  className={`w-full min-h-[100px] overflow-hidden resize-none rounded p-4 outline-none border-t border-gray-300 dark:border-gray-600 pt-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${showError && !formData.procedures ? 'border-2 border-red-500' : ''}`} 
                  placeholder="예: 서류 → 면접 → 합격" 
                />
                {showError && !formData.procedures && <div className="text-red-500 text-xs text-left">전형절차를 입력하세요.</div>}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4 text-gray-900 dark:text-white">
                <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">모집 정보 설정</h4>
                <div className="border-t border-gray-300 dark:border-gray-600 px-4 pt-3 space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <label className="w-24 text-sm text-gray-700 dark:text-white">모집 인원:</label>
                    <input 
                      type="number" 
                      value={formData.headcount} 
                      onChange={(e) => handleInputChange(e, 'headcount')} 
                      className={`border px-2 py-1 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors ${showError && !formData.headcount ? 'border-red-500' : 'border-gray-400 dark:border-gray-600'}`} 
                    />
                  </div>
                  {showError && !formData.headcount && <div className="text-red-500 text-xs text-left">모집 인원을 입력하세요.</div>}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-sm text-gray-700 dark:text-white">근무지역:</label>
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={(e) => handleInputChange(e, 'location')} 
                      className={`border px-2 py-1 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors ${showError && !formData.location ? 'border-red-500' : 'border-gray-400 dark:border-gray-600'}`} 
                      placeholder="예: 서울시 강남구" 
                    />
                  </div>
                  {showError && !formData.location && <div className="text-red-500 text-xs text-left">근무지역을 입력하세요.</div>}
                  <div className="flex items-center gap-2">
                    <label className="w-24 text-sm text-gray-700 dark:text-white">고용형태:</label>
                    <select 
                      value={formData.employment_type}
                      onChange={(e) => handleInputChange(e, 'employment_type')} 
                      className={`border px-2 py-1 rounded w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors ${showError && !formData.employment_type ? 'border-red-500' : 'border-gray-400 dark:border-gray-600'}`}
                    >
                      <option value="">선택하세요</option>
                      {employmentTypeOptions.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  {showError && !formData.employment_type && <div className="text-red-500 text-xs text-left">고용형태를 선택하세요.</div>}
                  <div className="flex flex-col gap-2 overflow-x-hidden">
                    <label className="text-sm text-gray-700 dark:text-white">모집기간:</label>
                    <div className="flex flex-col md:flex-row items-center gap-1 w-full">
                      <DatePicker 
                        selected={formData.start_date}
                        onChange={(date) => handleInputChange({ target: { value: date } }, 'start_date')} 
                        selectsStart 
                        startDate={formData.start_date} 
                        endDate={formData.end_date} 
                        dateFormat="yyyy/MM/dd HH:mm" 
                        showTimeSelect
                        className={`w-full md:w-36 min-w-0 border px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-colors ${showError && !formData.start_date ? 'border-red-500' : 'border-gray-400 dark:border-gray-600'}`}
                        placeholderText="시작일시" 
                        calendarClassName="bg-white text-gray-900 dark:bg-gray-800 dark:text-white" 
                        popperClassName="dark:bg-gray-800 dark:text-white border-0 shadow-lg" 
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300 px-1">~</span>
                      <DatePicker 
                        selected={formData.end_date} 
                        onChange={(date) => handleInputChange({ target: { value: date } }, 'end_date')} 
                        selectsEnd 
                        startDate={formData.start_date} 
                        endDate={formData.end_date} 
                        minDate={formData.start_date} 
                        dateFormat="yyyy/MM/dd HH:mm" 
                        showTimeSelect
                        className={`w-full md:w-36 min-w-0 border px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm transition-colors ${showError && !formData.end_date ? 'border-red-500' : 'border-gray-400 dark:border-gray-600'}`}
                        placeholderText="종료일시" 
                        calendarClassName="bg-white text-gray-900 dark:bg-gray-800 dark:text-white" 
                        popperClassName="dark:bg-gray-800 dark:text-white border-0 shadow-lg" 
                      />
                    </div>
                    {showError && (!formData.start_date || !formData.end_date) && (
                      <div className="text-red-500 text-xs text-left mt-1">시작일시와 종료일시를 모두 입력하세요.</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4 text-gray-900 dark:text-white">
                <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">채용팀 편성</h4>
                <div className="border-t border-gray-300 dark:border-gray-600 px-4 pt-3 space-y-3">
                  {teamMembers.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <input type="email" value={member.email} onChange={e => setTeamMembers(prev => prev.map((m, i) => i === idx ? { ...m, email: e.target.value } : m))} className={`flex-1 border px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${showError && !member.email ? 'border-red-500' : 'border-gray-400 dark:border-gray-600'}`} placeholder="이메일" />
                      <select value={member.role} onChange={e => setTeamMembers(prev => prev.map((m, i) => i === idx ? { ...m, role: e.target.value } : m))} className={`w-32 border px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${showError && !member.role ? 'border-red-500' : 'border-gray-400 dark:border-gray-600'}`} >
                        <option value="">권한 선택</option>
                        <option value="관리자">관리자</option>
                        <option value="멤버">멤버</option>
                      </select>
                      <button type="button" onClick={() => setTeamMembers(prev => prev.filter((_, i) => i !== idx))} className="text-red-500 text-xl font-bold">×</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setTeamMembers(prev => [...prev, { email: '', role: '' }])} className="text-sm text-blue-600 hover:underline ml-4 mt-3">+ 멤버 추가</button>
                  {showError && !isTeamValid && <div className="text-red-500 text-sm mt-1">모든 팀원 이메일과 권한을 입력하세요.</div>}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4 text-gray-900 dark:text-white">
                <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">면접 일정</h4>
                <div className="border-t border-gray-300 dark:border-gray-600 px-4 pt-3 space-y-4">
                  {schedules.map((sch, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">면접 일정 {idx + 1}</span>
                        <button 
                          type="button" 
                          onClick={() => setSchedules(prev => prev.filter((_, i) => i !== idx))} 
                          className="text-red-500 hover:text-red-700 dark:hover:text-red-400 text-lg font-bold p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-xs text-gray-600 dark:text-gray-400">날짜</label>
                          <DatePicker 
                            selected={sch.date} 
                            onChange={date => setSchedules(prev => prev.map((s, i) => i === idx ? { ...s, date } : s))} 
                            dateFormat="yyyy/MM/dd" 
                            className={`w-full border px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm ${showError && !sch.date ? 'border-red-500' : 'border-gray-400 dark:border-gray-600'}`} 
                            placeholderText="날짜 선택" 
                            calendarClassName="bg-white text-gray-900 dark:bg-gray-800 dark:text-white" 
                            popperClassName="dark:bg-gray-800 dark:text-white border-0 shadow-lg" 
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-xs text-gray-600 dark:text-gray-400">시간</label>
                          <TimePicker 
                            value={sch.time} 
                            onChange={e => setSchedules(prev => prev.map((s, i) => i === idx ? { ...s, time: e.target.value } : s))} 
                            placeholder="시간 선택"
                            error={showError && !sch.time}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-xs text-gray-600 dark:text-gray-400">장소</label>
                        <input 
                          type="text" 
                          value={sch.place} 
                          onChange={e => setSchedules(prev => prev.map((s, i) => i === idx ? { ...s, place: e.target.value } : s))} 
                          className={`w-full border px-2 py-1 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm ${showError && !sch.place ? 'border-red-500' : 'border-gray-400 dark:border-gray-600'}`} 
                          placeholder="면접 장소 (예: 회사 3층 회의실)" 
                        />
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    type="button" 
                    onClick={() => setSchedules(prev => [...prev, { date: null, time: '', place: '' }])} 
                    className="w-full text-sm text-blue-600 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 py-2 rounded border-dashed border-blue-300 dark:border-blue-600 transition-colors"
                  >
                    + 면접 일정 추가
                  </button>
                  
                  {showError && schedules.length === 0 && (
                    <div className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      최소 하나의 면접 일정을 추가해 주세요.
                    </div>
                  )}
                  {showError && schedules.length > 0 && schedules.some(s => !s.date || !s.time || !s.place) && (
                    <div className="text-red-500 text-xs bg-red-50 dark:bg-red-900/20 p-2 rounded">
                      모든 면접 일정의 날짜, 시간, 장소를 입력하세요.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {showError && !isReady && <div className="text-red-500 text-center mt-2">기입하지 않은 항목이 있습니다. 모든 항목을 입력해 주세요.</div>}
          <div className="flex justify-center mt-10">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded text-lg">수정 완료</button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default EditPost;
