import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Layout from '../layout/Layout';
import ViewPostSidebar from '../components/ViewPostSidebar';
import { getReportCache, setReportCache, getCacheStatus, getCacheStatusSummary, clearAllReportCache } from '../utils/reportCache';
import {
  MdDownload, MdPrint, MdDescription, MdQuestionAnswer, MdAssessment,
  MdTrendingUp, MdTrendingDown, MdAnalytics, MdStar, MdStarBorder,
  MdFileDownload, MdCompare, MdInsights, MdRefresh, MdSettings,
  MdCheckCircle, MdRadioButtonUnchecked, MdCached
} from 'react-icons/md';

function FinalReport() {
  const [documentData, setDocumentData] = useState(null);
  const [writtenTestData, setWrittenTestData] = useState(null);
  const [interviewData, setInterviewData] = useState(null);
  const [jobPostData, setJobPostData] = useState(null);
  const [loadingText, setLoadingText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cacheStatus, setCacheStatus] = useState(''); // New state for cache status
  const [missingReports, setMissingReports] = useState([]); // 누락된 보고서 목록
  const [isRefreshing, setIsRefreshing] = useState(false);
  const loadingInterval = useRef(null);
  const fullText = '최종 보고서 생성 중입니다...';
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const jobPostId = searchParams.get("job_post_id");

  useEffect(() => {
    if (jobPostId) {
      console.log('[FinalReport] jobPostId:', jobPostId);
      loadAllReportData();
    }
  }, [jobPostId]);

  // 로딩 텍스트 애니메이션
  useEffect(() => {
    if (isLoading) {
      setLoadingText('');
      let i = 0;
      if (loadingInterval.current) clearInterval(loadingInterval.current);
      loadingInterval.current = setInterval(() => {
        setLoadingText(fullText.slice(0, i + 1));
        i++;
        if (i > fullText.length) i = 0;
      }, 120);
      return () => clearInterval(loadingInterval.current);
    }
  }, [isLoading]);

  const loadAllReportData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📊 최종 보고서 데이터 로드 시작...');
      
      // Cache status check and display
      const cacheStatusData = getCacheStatus(jobPostId);
      const cacheSummary = getCacheStatusSummary(jobPostId);
      setCacheStatus(cacheSummary);
      console.log('📋 캐시 상태:', cacheStatusData);
      console.log('📋 캐시 요약:', cacheSummary);

      // 누락된 보고서 확인
      const missing = [];
      if (!cacheStatusData.document?.exists || cacheStatusData.document?.expired) missing.push('서류 보고서');
      if (!cacheStatusData.written?.exists || cacheStatusData.written?.expired) missing.push('직무적성평가 보고서');
      if (!cacheStatusData.interview?.exists || cacheStatusData.interview?.expired) missing.push('면접 보고서');
      setMissingReports(missing);

      // 0. 최종 보고서 캐시 확인 (우선)
      console.log('0️⃣ 최종 보고서 캐시 확인 중...');
      let cachedFinalReport = getReportCache('final', jobPostId);
      if (cachedFinalReport && cachedFinalReport.jobPostData) {
        console.log('📦 최종 보고서 캐시 사용');
        console.log('📦 캐시된 jobPostData:', cachedFinalReport.jobPostData);
        console.log('📦 캐시된 interviewData:', cachedFinalReport.interviewData);
        setJobPostData(cachedFinalReport.jobPostData);
        setDocumentData(cachedFinalReport.documentData);
        setWrittenTestData(cachedFinalReport.writtenTestData?.data);
        setInterviewData(cachedFinalReport.interviewData || {
          ai: null,
          practical: null,
          executive: null,
          final: null
        });
        setIsLoading(false);
        return;
      } else if (cachedFinalReport) {
        console.log('⚠️ 캐시에 jobPostData가 없음, API에서 다시 가져옴');
      }
      
      // 1. Fetch job post data (always fresh)
      const jobPostResponse = await axiosInstance.get(`/company/jobposts/${jobPostId}`, { timeout: 10000 });
      console.log('[FinalReport] 공고 정보 API 응답:', jobPostResponse.data);
      setJobPostData(jobPostResponse.data);
      console.log('✅ 공고 정보 로드 완료');

      // 2. Document Report Data (cache first)
      let documentData = getReportCache('document', jobPostId);
      if (documentData) {
        console.log('📦 서류 보고서 캐시 사용');
        setDocumentData(documentData);
      } else {
        console.log('🌐 서류 보고서 API 호출');
        const documentResponse = await axiosInstance.get(`/report/document?job_post_id=${jobPostId}`, { timeout: 15000 });
        documentData = documentResponse.data;
        setDocumentData(documentData);
        setReportCache('document', jobPostId, documentData);
        console.log('✅ 서류 보고서 로드 완료');
      }

      // 3. Written Test Report Data (cache first)
      let writtenTestData = getReportCache('written', jobPostId);
      if (writtenTestData) {
        console.log('📦 직무적성평가 보고서 캐시 사용');
        setWrittenTestData(writtenTestData.data);
      } else {
        console.log('🌐 직무적성평가 보고서 API 호출');
        const writtenTestResponse = await axiosInstance.get(`/report/job-aptitude?job_post_id=${jobPostId}`, { timeout: 15000 });
        writtenTestData = { data: writtenTestResponse.data };
        setWrittenTestData(writtenTestData.data);
        setReportCache('written', jobPostId, writtenTestData);
        console.log('✅ 직무적성평가 보고서 로드 완료');
      }

      // 4. Interview Report Data (cache first)
      let interviewData = getReportCache('interview', jobPostId);
      if (interviewData) {
        console.log('📦 면접 보고서 캐시 사용');
        console.log('📦 캐시된 면접 데이터:', interviewData);
        setInterviewData(interviewData);
      } else {
        console.log('🌐 면접 보고서 API 호출');
        // AI 면접 데이터 조회
        const aiResponse = await axiosInstance.get(`/ai-interview/evaluations/job-post/${jobPostId}`, { timeout: 15000 });
        const aiData = aiResponse.data;
        setInterviewData(prev => ({ ...prev, ai: aiData }));

        // 실무진 면접 데이터 조회
        const practicalResponse = await axiosInstance.get(`/interview-evaluation/job-post/${jobPostId}/practical`, { timeout: 15000 });
        const practicalData = practicalResponse.data;
        setInterviewData(prev => ({ ...prev, practical: practicalData }));

        // 임원진 면접 데이터 조회
        const executiveResponse = await axiosInstance.get(`/interview-evaluation/job-post/${jobPostId}/executive`, { timeout: 15000 });
        const executiveData = executiveResponse.data;
        setInterviewData(prev => ({ ...prev, executive: executiveData }));

        // 최종 선발자 데이터 조회
        const finalResponse = await axiosInstance.get(`/interview-evaluation/job-post/${jobPostId}/final-selected`, { timeout: 15000 });
        const finalData = finalResponse.data;
        setInterviewData(prev => ({ ...prev, final: finalData }));

        // 면접 데이터 캐시 저장
        const interviewCacheData = {
          ai: aiData,
          practical: practicalData,
          executive: executiveData,
          final: finalData
        };
        setReportCache('interview', jobPostId, interviewCacheData);
        console.log('✅ 면접 보고서 로드 완료');
      }

      // 5. 최종 보고서 데이터 캐시 저장
      console.log('5️⃣ 최종 보고서 데이터 캐시 저장 중...');
      console.log('📦 저장할 jobPostData:', jobPostData);
      console.log('📦 저장할 documentData:', documentData);
      console.log('📦 저장할 writtenTestData:', writtenTestData);
      console.log('📦 저장할 interviewData:', interviewData);
      
      const finalReportData = {
        jobPostData: jobPostData,
        documentData: documentData,
        writtenTestData: writtenTestData,
        interviewData: interviewData,
        timestamp: Date.now()
      };
      
      // jobPostData가 유효한 경우에만 캐시 저장
      if (jobPostData) {
        setReportCache('final', jobPostId, finalReportData);
        console.log('✅ 최종 보고서 캐시 저장 완료');
      } else {
        console.warn('⚠️ jobPostData가 없어서 캐시 저장하지 않음');
      }

      console.log('🎉 모든 데이터 로드 완료!');
      setIsLoading(false);
      
    } catch (error) {
      console.error('💥 최종 보고서 데이터 로드 실패:', error);
      
      // 더 구체적인 에러 메시지
      let errorMessage = '보고서 데이터를 불러오는 중 오류가 발생했습니다.';
      if (error.code === 'ECONNABORTED') {
        errorMessage = '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
      } else if (error.response?.status === 404) {
        errorMessage = '해당 공고를 찾을 수 없습니다.';
      } else if (error.response?.status === 500) {
        errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    const token = localStorage.getItem('token');
    const url = `http://localhost:8000/api/v1/report/final/pdf?job_post_id=${jobPostId}`;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head><title>PDF 다운로드 중...</title>
          <style>
            body { background: #f9fafb; margin: 0; height: 100vh; display: flex; align-items: center; justify-content: center; }
            .container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; }
            .msg { font-size: 26px; font-weight: 800; color: #2563eb; margin-bottom: 8px; text-align: center; letter-spacing: 1px; min-height: 40px; }
            .sub { font-size: 16px; color: #64748b; text-align: center; }
          </style>
          </head>
          <body>
            <div class="container">
              <div class="msg">PDF 다운로드 중...</div>
              <div class="sub">잠시만 기다려 주세요.</div>
            </div>
          </body>
        </html>
      `);
      
      // PDF 다운로드
      fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(response => response.blob())
      .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `최종보고서_${jobPostData?.title || '공고'}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        newWindow.close();
      })
      .catch(error => {
        console.error('PDF 다운로드 실패:', error);
        newWindow.close();
        alert('PDF 다운로드에 실패했습니다.');
      });
    }
  };

  const handleRefreshFinalCache = async () => {
    if (window.confirm('최종 보고서 캐시를 새로고침하시겠습니까?')) {
      setIsRefreshing(true);
      clearReportCache('final', jobPostId);
      
      try {
        console.log('🌐 최종 보고서 API 재호출');
        
        // 1. 공고 정보 조회
        const jobPostResponse = await axiosInstance.get(`/company/jobposts/${jobPostId}`, { timeout: 10000 });
        setJobPostData(jobPostResponse.data);
        
        // 2. 서류 보고서 데이터 조회
        const documentResponse = await axiosInstance.get(`/report/document?job_post_id=${jobPostId}`, { timeout: 15000 });
        setDocumentData(documentResponse.data);
        
        // 3. 직무적성평가 보고서 데이터 조회
        const writtenTestResponse = await axiosInstance.get(`/report/job-aptitude?job_post_id=${jobPostId}`, { timeout: 15000 });
        setWrittenTestData({ data: writtenTestResponse.data });
        
        // 4. 면접 보고서 데이터 조회
        const aiResponse = await axiosInstance.get(`/ai-interview/evaluations/job-post/${jobPostId}`, { timeout: 15000 });
        const practicalResponse = await axiosInstance.get(`/interview-evaluation/job-post/${jobPostId}/practical`, { timeout: 15000 });
        const executiveResponse = await axiosInstance.get(`/interview-evaluation/job-post/${jobPostId}/executive`, { timeout: 15000 });
        const finalResponse = await axiosInstance.get(`/interview-evaluation/job-post/${jobPostId}/final-selected`, { timeout: 15000 });
        
        const interviewCacheData = {
          ai: aiResponse.data,
          practical: practicalResponse.data,
          executive: executiveResponse.data,
          final: finalResponse.data
        };
        setInterviewData(interviewCacheData);
        
        // 5. 최종 보고서 데이터 캐시 저장
        const finalReportData = {
          jobPostData: jobPostResponse.data,
          documentData: documentResponse.data,
          writtenTestData: { data: writtenTestResponse.data },
          interviewData: interviewCacheData,
          timestamp: Date.now()
        };
        
        setReportCache('final', jobPostId, finalReportData);
        console.log('✅ 최종 보고서 캐시 새로고침 완료');
        alert('최종 보고서 캐시가 새로고침되었습니다.');
      } catch (error) {
        console.error('최종 보고서 캐시 새로고침 실패:', error);
        alert('최종 보고서 캐시 새로고침에 실패했습니다.');
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const handleRefreshDocumentCache = async () => {
    if (window.confirm('서류 보고서 캐시를 새로고침하시겠습니까?')) {
      try {
        clearReportCache('document', jobPostId);
        console.log('🌐 서류 보고서 API 재호출');
        const response = await axiosInstance.get(`/report/document?job_post_id=${jobPostId}`, { timeout: 15000 });
        setDocumentData(response.data);
        setReportCache('document', jobPostId, response.data);
        console.log('✅ 서류 보고서 캐시 새로고침 완료');
        alert('서류 보고서 캐시가 새로고침되었습니다.');
      } catch (error) {
        console.error('서류 보고서 캐시 새로고침 실패:', error);
        alert('서류 보고서 캐시 새로고침에 실패했습니다.');
      }
    }
  };

  const handleRefreshWrittenCache = async () => {
    if (window.confirm('직무적성평가 보고서 캐시를 새로고침하시겠습니까?')) {
      try {
        clearReportCache('written', jobPostId);
        console.log('🌐 직무적성평가 보고서 API 재호출');
        const response = await axiosInstance.get(`/report/job-aptitude?job_post_id=${jobPostId}`, { timeout: 15000 });
        setWrittenTestData({ data: response.data });
        setReportCache('written', jobPostId, { data: response.data });
        console.log('✅ 직무적성평가 보고서 캐시 새로고침 완료');
        alert('직무적성평가 보고서 캐시가 새로고침되었습니다.');
      } catch (error) {
        console.error('직무적성평가 보고서 캐시 새로고침 실패:', error);
        alert('직무적성평가 보고서 캐시 새로고침에 실패했습니다.');
      }
    }
  };

  const handleRefreshInterviewCache = async () => {
    if (window.confirm('면접 보고서 캐시를 새로고침하시겠습니까?')) {
      try {
        clearReportCache('interview', jobPostId);
        console.log('🌐 면접 보고서 API 재호출');
        
        // AI 면접 데이터 조회
        const aiResponse = await axiosInstance.get(`/ai-interview/evaluations/job-post/${jobPostId}`, { timeout: 15000 });
        const aiData = aiResponse.data;
        
        // 실무진 면접 데이터 조회
        const practicalResponse = await axiosInstance.get(`/interview-evaluation/job-post/${jobPostId}/practical`, { timeout: 15000 });
        const practicalData = practicalResponse.data;
        
        // 임원진 면접 데이터 조회
        const executiveResponse = await axiosInstance.get(`/interview-evaluation/job-post/${jobPostId}/executive`, { timeout: 15000 });
        const executiveData = executiveResponse.data;
        
        // 최종 선발자 데이터 조회
        const finalResponse = await axiosInstance.get(`/interview-evaluation/job-post/${jobPostId}/final-selected`, { timeout: 15000 });
        const finalData = finalResponse.data;
        
        // 면접 데이터 캐시 저장
        const interviewCacheData = {
          ai: aiData,
          practical: practicalData,
          executive: executiveData,
          final: finalData
        };
        setInterviewData(interviewCacheData);
        setReportCache('interview', jobPostId, interviewCacheData);
        console.log('✅ 면접 보고서 캐시 새로고침 완료');
        alert('면접 보고서 캐시가 새로고침되었습니다.');
      } catch (error) {
        console.error('면접 보고서 캐시 새로고침 실패:', error);
        alert('면접 보고서 캐시 새로고침에 실패했습니다.');
      }
    }
  };

  const navigateToReport = (reportType) => {
    switch (reportType) {
      case 'document':
        navigate(`/report/document?job_post_id=${jobPostId}`);
        break;
      case 'written':
        navigate(`/report/job-aptitude?job_post_id=${jobPostId}`);
        break;
      case 'interview':
        navigate(`/interview-report?job_post_id=${jobPostId}`);
        break;
      default:
        break;
    }
  };

  // 누락된 보고서가 있으면 안내 메시지 표시
  if (missingReports.length > 0 && !isLoading) {
    return (
      <Layout>
        <ViewPostSidebar jobPost={jobPostId ? { id: jobPostId } : null} />
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg mx-auto max-w-4xl my-10">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-4">
            📋 누락된 보고서가 있습니다
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
            다음 보고서들이 필요합니다:
          </div>
          <div className="flex flex-col gap-2 mb-6">
            {missingReports.map((report, index) => (
              <div key={index} className="flex items-center gap-3 px-4 py-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <span className="text-orange-600 dark:text-orange-400">⚠️</span>
                <span className="text-gray-700 dark:text-gray-300">{report}</span>
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-500 text-center mb-6">
            각 보고서 페이지에서 데이터를 로드한 후 다시 확인해주세요.
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                setMissingReports([]);
                loadAllReportData();
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              모든 보고서 다시 로드
            </button>
            <button 
              onClick={() => setMissingReports([])}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg"
            >
              무시하고 계속
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <ViewPostSidebar jobPost={jobPostId ? { id: jobPostId } : null} />
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg mx-auto max-w-4xl my-10">
          <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mb-8 text-center tracking-wide min-h-10">
            {loadingText}
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-400 text-center">잠시만 기다려 주세요.</div>
          <div className="text-sm text-gray-500 dark:text-gray-500 text-center mt-4">
            여러 보고서 데이터를 순차적으로 로드하고 있습니다...
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ViewPostSidebar jobPost={jobPostId ? { id: jobPostId } : null} />
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg mx-auto max-w-4xl my-10">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">{error}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
            일부 데이터를 불러오지 못했을 수 있습니다. 다시 시도하거나 개별 보고서를 확인해보세요.
          </div>
          <div className="flex gap-3">
            <button 
              onClick={loadAllReportData}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              다시 시도
            </button>

          </div>
        </div>
      </Layout>
    );
  }

  // 최소한의 데이터가 있는지 확인 (isLoading이 false일 때만)
  if (!jobPostData) {
    console.warn('[FinalReport] jobPostData가 없습니다:', jobPostData);
    return (
      <Layout>
        <ViewPostSidebar jobPost={jobPostId ? { id: jobPostId } : null} />
        <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-lg mx-auto max-w-4xl my-10">
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">공고 정보를 불러올 수 없습니다.</div>
        </div>
      </Layout>
    );
  }

  // 데이터 처리 (안전한 접근)
  console.log('🔍 렌더링 시 interviewData:', interviewData);
  console.log('🔍 렌더링 시 interviewData.final:', interviewData?.final);
  console.log('🔍 렌더링 시 interviewData.final?.evaluations:', interviewData?.final?.evaluations);
  console.log('🔍 렌더링 시 documentData:', documentData);
  console.log('🔍 렌더링 시 documentData.stats:', documentData?.stats);
  console.log('🔍 렌더링 시 documentData.stats.passed_applicants:', documentData?.stats?.passed_applicants);
  
  const totalApplicants = documentData?.stats?.total_applicants || 0;
  const documentPassed = documentData?.stats?.passed_applicants_count || 0;
  const writtenTestPassed = writtenTestData?.stats?.passed_applicants_count || 0;
  const finalSelected = interviewData?.final?.evaluations?.length || 0;

  const documentPassRate = totalApplicants > 0 ? ((documentPassed / totalApplicants) * 100).toFixed(1) : 0;
  const writtenTestPassRate = documentPassed > 0 ? ((writtenTestPassed / documentPassed) * 100).toFixed(1) : 0;
  const finalPassRate = writtenTestPassed > 0 ? ((finalSelected / writtenTestPassed) * 100).toFixed(1) : 0;

  // 데이터 가용성 확인
  const hasDocumentData = documentData && documentData.stats;
  const hasWrittenTestData = writtenTestData && writtenTestData.stats;
  const hasInterviewData = interviewData && (
    interviewData.ai?.evaluations?.length > 0 || 
    interviewData.practical?.evaluations?.length > 0 || 
    interviewData.executive?.evaluations?.length > 0 || 
    interviewData.final?.evaluations?.length > 0
  );
  
  console.log('🔍 hasInterviewData:', hasInterviewData);
  console.log('🔍 finalSelected:', finalSelected);

  return (
    <Layout>
      <ViewPostSidebar jobPost={jobPostData || (jobPostId ? { id: jobPostId } : null)} />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4" style={{ marginLeft: 90 }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  최종 채용 보고서
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                  {jobPostData?.title} - {new Date().toLocaleDateString('ko-KR')}
                </p>
                {cacheStatus && (
                  <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                    📦 캐시 상태: {cacheStatus}
                  </p>
                )}
              </div>
                              <div className="flex gap-3">
                  <button 
                    onClick={handleRefreshFinalCache}
                    disabled={isRefreshing}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                      isRefreshing 
                        ? 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
                        : 'bg-gray-600 dark:bg-gray-700 text-white hover:bg-gray-700 dark:hover:bg-gray-800'
                    }`}
                    title="캐시 새로고침"
                  >
                    <MdCached size={20} className={isRefreshing ? 'animate-spin' : ''} />
                    {isRefreshing ? '새로고침 중...' : '캐시 새로고침'}
                  </button>
                <button 
                  onClick={handleDownload}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                >
                  <MdDownload size={20} />
                  PDF 다운로드
                </button>
              </div>
            </div>
          </div>

          {/* Overall Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">전체 지원자</p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalApplicants}명</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <MdAnalytics size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">서류 합격자</p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{documentPassed}명</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{documentPassRate}%</p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <MdDescription size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">필기 합격자</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{writtenTestPassed}명</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{writtenTestPassRate}%</p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <MdQuestionAnswer size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">최종 선발자</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{finalSelected}명</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{finalPassRate}%</p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <MdAssessment size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* 최종 선발자 정보 */}
          {interviewData?.final?.evaluations?.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <MdStar size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">최종 선발자</h2>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                  {interviewData.final.evaluations.length}명 선발
                </span>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {interviewData.final.evaluations.map((applicant, index) => (
                  <div key={index} className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900 rounded-xl p-6 border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            {applicant.applicant_name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">최종 선발 순위</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {applicant.final_score?.toFixed(1) || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">최종 점수 (100점 만점)</div>
                      </div>
                    </div>
                    
                    {/* 단계별 점수 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {(() => {
                            // 서류 점수 찾기
                            const documentApplicant = documentData?.stats?.passed_applicants?.find(
                              app => app.name === applicant.applicant_name
                            );
                            
                            if (documentApplicant) {
                              console.log(`🔍 ${applicant.applicant_name} 서류 데이터:`, documentApplicant);
                              // ai_score 또는 total_score 사용
                              const score = documentApplicant?.ai_score !== undefined && documentApplicant?.ai_score !== null 
                                ? documentApplicant.ai_score 
                                : documentApplicant?.total_score;
                              return score ? Math.round(score) : 'N/A';
                            } else {
                              console.log(`❌ ${applicant.applicant_name} 서류 데이터 없음`);
                              return 'N/A';
                            }
                          })()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">서류 점수</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">(100점 만점)</div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-600 dark:text-green-400">
                          {(() => {
                            // 필기 점수 찾기
                            const writtenApplicant = writtenTestData?.stats?.passed_applicants?.find(
                              app => app.name === applicant.applicant_name
                            );
                            
                            if (writtenApplicant) {
                              console.log(`🔍 ${applicant.applicant_name} 필기 데이터:`, writtenApplicant);
                              return writtenApplicant?.written_score?.toFixed(1) || 'N/A';
                            } else {
                              console.log(`❌ ${applicant.applicant_name} 필기 데이터 없음`);
                              return 'N/A';
                            }
                          })()}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">필기 점수</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">(5점 만점)</div>
                      </div>
                      
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                          {applicant.final_score?.toFixed(1) || 0}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">면접 점수</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">(100점 만점)</div>
                      </div>
                    </div>
                    
                    {/* 면접 세부 점수 */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">면접 세부 점수</h4>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {applicant.ai_interview_score?.toFixed(1) || 0}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">AI 면접</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {applicant.practical_score?.toFixed(1) || 0}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">실무진</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {applicant.executive_score?.toFixed(1) || 0}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">임원진</div>
                        </div>
                      </div>
                    </div>
                    
                    {applicant.evaluation_comment && (
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">종합 평가</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          "{applicant.evaluation_comment}"
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 종합 통계 */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <MdTrendingUp size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">종합 통계</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                  {totalApplicants > 0 ? ((finalSelected / totalApplicants) * 100).toFixed(1) : 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">전체 합격률</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">
                  {finalSelected}명 / {totalApplicants}명
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                  {documentData?.stats?.avg_score?.toFixed(1) || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">서류 평균 점수</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">(100점 만점)</div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                  {writtenTestData?.stats?.total_average_score?.toFixed(1) || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">필기 평균 점수</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">(5점 만점)</div>
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900 rounded-lg">
                <div className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                  {interviewData?.final?.evaluations?.length > 0 
                    ? (interviewData.final.evaluations.reduce((sum, app) => sum + (app.final_score || 0), 0) / interviewData.final.evaluations.length).toFixed(1)
                    : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">최종 평균 점수</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">(100점 만점)</div>
              </div>
            </div>
            
            {/* 추가 통계 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                  {documentData?.stats?.max_score?.toFixed(1) || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">서류 최고 점수</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">(100점 만점)</div>
              </div>
              
              <div className="text-center p-4 bg-teal-50 dark:bg-teal-900 rounded-lg">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400 mb-2">
                  {writtenTestData?.stats?.cutoff_score?.toFixed(1) || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">필기 합격 기준</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">(5점 만점)</div>
              </div>
              
              <div className="text-center p-4 bg-pink-50 dark:bg-pink-900 rounded-lg">
                <div className="text-2xl font-bold text-pink-600 dark:text-pink-400 mb-2">
                  {interviewData?.final?.evaluations?.length > 0 
                    ? Math.max(...interviewData.final.evaluations.map(app => app.final_score || 0)).toFixed(1)
                    : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">최종 최고 점수</div>
                <div className="text-xs text-gray-500 dark:text-gray-500">(100점 만점)</div>
              </div>
            </div>
            
            {/* 단계별 진행 상황 */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">단계별 진행 상황</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">서류 전형</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">100점 만점</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{documentPassed}명</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">합격</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {totalApplicants > 0 ? ((documentPassed / totalApplicants) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">직무적성평가</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">5점 만점</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">{writtenTestPassed}명</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">합격</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {documentPassed > 0 ? ((writtenTestPassed / documentPassed) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                    <div>
                      <span className="font-medium text-gray-900 dark:text-white">면접</span>
                      <div className="text-xs text-gray-500 dark:text-gray-400">100점 만점</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-purple-600 dark:text-purple-400">{finalSelected}명</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">최종 선발</div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {writtenTestPassed > 0 ? ((finalSelected / writtenTestPassed) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 채용 완료 요약 */}
              <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900 dark:to-blue-900 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3 mb-2">
                  <MdCheckCircle size={20} className="text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-gray-900 dark:text-white">채용 완료 요약</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">모집 인원: </span>
                    <span className="font-medium text-gray-900 dark:text-white">{jobPostData?.recruit_count || 0}명</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">최종 선발: </span>
                    <span className="font-medium text-gray-900 dark:text-white">{finalSelected}명</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">달성률: </span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {jobPostData?.recruit_count > 0 ? ((finalSelected / jobPostData.recruit_count) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* 서류 전형 보고서 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">서류 전형 보고서</h3>
                {hasDocumentData ? (
                  <MdCheckCircle size={20} className="text-green-500" />
                ) : (
                  <MdRadioButtonUnchecked size={20} className="text-gray-400" />
                )}
              </div>
              {hasDocumentData ? (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">평균 점수</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {documentData.stats.avg_score || 0}점
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">최고 점수</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {documentData.stats.max_score || 0}점
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">합격률</span>
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        {documentPassRate}%
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigateToReport('document')}
                    className="w-full bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-800 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    상세 보기
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">서류 전형 데이터가 없습니다.</p>
                  <button 
                    onClick={() => navigateToReport('document')}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-2 rounded-lg text-sm font-medium"
                  >
                    서류 보고서 확인
                  </button>
                </div>
              )}
            </div>

            {/* 직무적성평가 보고서 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">직무적성평가 보고서</h3>
                {hasWrittenTestData ? (
                  <MdCheckCircle size={20} className="text-green-500" />
                ) : (
                  <MdRadioButtonUnchecked size={20} className="text-gray-400" />
                )}
              </div>
              {hasWrittenTestData ? (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">평균 점수</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {writtenTestData.stats.total_average_score || 0}점
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">커트라인</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {writtenTestData.stats.cutoff_score || 0}점
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">합격률</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {writtenTestPassRate}%
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigateToReport('written')}
                    className="w-full bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 hover:bg-green-100 dark:hover:bg-green-800 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    상세 보기
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">직무적성평가 데이터가 없습니다.</p>
                  <button 
                    onClick={() => navigateToReport('written')}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-2 rounded-lg text-sm font-medium"
                  >
                    직무적성평가 보고서 확인
                  </button>
                </div>
              )}
            </div>

            {/* 면접 보고서 */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">면접 보고서</h3>
                {hasInterviewData ? (
                  <MdCheckCircle size={20} className="text-green-500" />
                ) : (
                  <MdRadioButtonUnchecked size={20} className="text-gray-400" />
                )}
              </div>
              {hasInterviewData ? (
                <>
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">AI 면접</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {interviewData.ai?.evaluations?.length || 0}명
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">실무진 면접</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {interviewData.practical?.evaluations?.length || 0}명
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">최종 선발</span>
                      <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        {finalSelected}명
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigateToReport('interview')}
                    className="w-full bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-800 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    상세 보기
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">면접 데이터가 없습니다.</p>
                  <button 
                    onClick={() => navigateToReport('interview')}
                    className="w-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 py-2 rounded-lg text-sm font-medium"
                  >
                    면접 보고서 확인
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Final Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">채용 과정 요약</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">전형 단계별 현황</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">1단계: 서류 전형</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {documentPassed}/{totalApplicants} ({documentPassRate}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">2단계: 필기시험</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {writtenTestPassed}/{documentPassed} ({writtenTestPassRate}%)
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">3단계: 면접</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {finalSelected}/{writtenTestPassed} ({finalPassRate}%)
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-3">최종 결과</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">전체 합격률</span>
                    <span className="text-sm font-medium text-purple-600 dark:text-purple-400">
                      {totalApplicants > 0 ? ((finalSelected / totalApplicants) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">모집 인원 대비</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {finalSelected}/{jobPostData?.headcount || 0}명
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">채용 완료율</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      {jobPostData?.headcount > 0 ? ((finalSelected / jobPostData.headcount) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default FinalReport; 