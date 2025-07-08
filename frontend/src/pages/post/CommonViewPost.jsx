import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../../layout/Layout';
import api from '../../api/api';
import ViewPostSidebar from '../../components/ViewPostSidebar';

function CommonViewPost() {
  const { jobPostId } = useParams();
  const [jobPost, setJobPost] = useState(null);
  const [jobPostLoading, setJobPostLoading] = useState(true);

  useEffect(() => {
    const fetchJobPost = async () => {
      setJobPostLoading(true);
      try {
        const response = await api.get(`/company/jobposts/${jobPostId}`);
        setJobPost(response.data);
      } catch (err) {
        setJobPost(null);
      } finally {
        setJobPostLoading(false);
      }
    };
    if (jobPostId) fetchJobPost();
  }, [jobPostId]);

  if (jobPostLoading) {
    return (
      <Layout title="로딩 중...">
        <ViewPostSidebar jobPost={jobPost} />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">로딩 중...</div>
        </div>
      </Layout>
    );
  }

  if (!jobPost) {
    return (
      <Layout title="공고 없음">
        <ViewPostSidebar jobPost={jobPost} />
        <div className="flex justify-center items-center h-screen">
          <div className="text-xl">존재하지 않는 공고입니다.</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="채용공고 상세보기">
      <ViewPostSidebar jobPost={jobPost} />
      <div className="min-h-screen bg-[#eef6ff] dark:bg-gray-900 p-6 mx-auto max-w-screen-xl" style={{ marginLeft: 90 }}>
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4 text-center space-y-2">
              <h2 className="text-2xl font-semibold text-gray-900 border-b border-gray-300 dark:border-gray-600 pb-2 dark:text-white">{jobPost.companyName}</h2>
              <p className="text-md text-gray-900 dark:text-gray-300">{jobPost.title}</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                <h4 className="text-lg font-semibold text-gray-900 ml-4 pb-2 dark:text-white">지원자격</h4>
                <pre className="whitespace-pre-wrap text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-2 px-4">{jobPost.qualifications}</pre>
              </div>
              <div className="w-full md:w-1/2 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
                <h4 className="text-lg font-semibold text-gray-900 ml-4 pb-2 dark:text-white">근무조건</h4>
                <pre className="whitespace-pre-wrap text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-2 px-4">{jobPost.conditions}</pre>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
              <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">모집분야 및 자격요건</h4>
              <pre className="whitespace-pre-wrap text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-2 px-4">{jobPost.jobDetails}</pre>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-400 p-4">
              <h4 className="text-lg font-semibold ml-4 pb-2 dark:text-white">전형절차</h4>
              <pre className="whitespace-pre-wrap text-gray-900 dark:text-white border-t border-gray-300 dark:border-gray-600 pt-2 px-4">{jobPost.procedures}</pre>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CommonViewPost;