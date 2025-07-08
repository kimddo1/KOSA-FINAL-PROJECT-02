import React, { useState, useEffect } from 'react';
import Layout from '../../layout/Layout';
import { FaPaperPlane, FaClock } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

function Email() {
  const location = useLocation();
  const { applicants, applicant, interviewInfo } = location.state || {};

  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  // 템플릿 자동 완성 (여러 명 지원)
  useEffect(() => {
    if (Array.isArray(applicants) && applicants.length > 0 && interviewInfo) {
      setRecipient(applicants.map(a => a.email).join(', '));
      setSubject(`면접 안내 (${applicants.length}명)`);
      setBody(
        applicants.map(a =>
          `${a.name}님,\n` +
          `아래와 같이 면접 일정을 안내드립니다.\n` +
          `- 일시: ${interviewInfo.date} ${interviewInfo.time}\n` +
          `- 장소: ${interviewInfo.place}\n` +
          (interviewInfo.memo ? `- 메모: ${interviewInfo.memo}\n` : '') +
          `\n`
        ).join('\n---------------------\n') +
        `감사합니다.`
      );
    } else if (applicant && interviewInfo) {
      setRecipient(applicant.email || '');
      setSubject(`${applicant.name}님 면접 안내`);
      setBody(
        `${applicant.name}님,\n\n` +
        `아래와 같이 면접 일정을 안내드립니다.\n` +
        `- 일시: ${interviewInfo.date} ${interviewInfo.time}\n` +
        `- 장소: ${interviewInfo.place}\n` +
        (interviewInfo.memo ? `- 메모: ${interviewInfo.memo}\n` : '') +
        `\n감사합니다.`
      );
    }
  }, [applicants, applicant, interviewInfo]);

  return (
    <Layout>
      <div className="min-h-screen w-full flex flex-col">
        {/* Title Box */}
        <div className="left-0 right-0 z-10 bg-white dark:bg-gray-800 shadow mt-20 mb-8 mx-64 px-8 py-4 flex items-center justify-center">
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            (불)합격자 이메일 발송
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full">
          <div className="flex w-full gap-6 px-36">
            <div className="w-full">
              {/* Email Form */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 p-8 space-y-8">
                {/* Recipient Field */}
                <div className="flex items-center gap-4">
                  <label className="w-20 text-base font-medium text-gray-700 dark:text-gray-300">
                    받는사람
                  </label>
                  <input
                    type="text"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="홍길동, 김길동 외"
                    className="flex-1 border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Subject Field */}
                <div className="flex items-center gap-4">
                  <label className="w-20 text-base font-medium text-gray-700 dark:text-gray-300">
                    제목
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="이메일 제목 입력"
                    className="flex-1 border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                {/* Email Template Preview */}
                <div className="w-full h-[300px] border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl p-6">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="합격메일 템플릿으로 바로 채워지기 (이름, 캘린더 날짜 모두 채워진 상태)"
                    className="w-full h-full resize-none bg-transparent text-sm text-gray-800 dark:text-gray-200 focus:outline-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 pt-4">
                  <button className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 px-6 py-2.5 rounded-xl transition-colors">
                    <FaClock className="text-lg" />
                    <span>보내기 예약</span>
                  </button>
                  <button className="flex items-center gap-2 bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-2.5 rounded-xl transition-colors">
                    <FaPaperPlane className="text-lg" />
                    <span>먼저 보내기</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Email;
