import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, VStack, Button, IconButton, useColorModeValue, Tooltip } from '@chakra-ui/react';
import { CiHome, CiSettings, CiBellOn, CiUser } from 'react-icons/ci';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import "../styles/datepicker.css";
import { ko } from 'date-fns/locale';
import { format, isBefore, isAfter, parseISO, compareAsc } from 'date-fns';

export default function UnifiedSidebar({ type = 'navigation' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const headerHeight = 64;
  const sidebarBg = useColorModeValue('white', '#1a202c');
  const borderColor = useColorModeValue('#e2e8f0', '#2d3748');

  // 면접 일정 예시 데이터 (일정 관리용)
  const interviewEvents = {
    '2025-05-30': [
      { name: '홍길동', role: '풀스택 개발 면접', time: '14:00' },
      { name: '김민준', role: '백엔드 개발 면접', time: '15:00' }
    ],
    '2025-05-05': [
      { name: '김민준', role: '풀스택 개발 면접', time: '16:00' }
    ]
  };

  // 네비게이션 사이드바 렌더링
  const renderNavigationSidebar = () => {
    return (
      <Box
        position="fixed"
        left={0}
        top={`${headerHeight}px`}
        w="80px"
        h={`calc(100vh - ${headerHeight}px)`}
        bg={sidebarBg}
        borderRight={`1px solid ${borderColor}`}
        zIndex={900}
        pt={4}
        boxShadow="md"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="space-between"
      >
        <VStack spacing={4} mt={2}>
          <Tooltip label="홈" placement="right">
            <Button
              w="60px"
              h="60px"
              variant="ghost"
              onClick={() => navigate("/")}
              leftIcon={<CiHome size={28} />}
              fontSize="sm"
              justifyContent="center"
              alignItems="center"
              p={0}
              color={useColorModeValue('gray.700', 'white')}
            />
          </Tooltip>
        </VStack>
        <VStack spacing={2} mb={4}>
          <Tooltip label="설정" placement="right">
            <IconButton
              aria-label="설정"
              icon={<CiSettings size={22} />}
              variant="ghost"
              size="sm"
              onClick={() => navigate('/settings')}
              color={useColorModeValue('gray.700', 'white')}
            />
          </Tooltip>
          <Tooltip label="알림" placement="right">
            <IconButton
              aria-label="알림"
              icon={<CiBellOn size={22} />}
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notifications')}
              color={useColorModeValue('gray.700', 'white')}
            />
          </Tooltip>
          <Tooltip label="내 정보" placement="right">
            <IconButton
              aria-label="내 정보"
              icon={<CiUser size={22} />}
              variant="ghost"
              size="sm"
              onClick={() => navigate('/mypage')}
              color={useColorModeValue('gray.700', 'white')}
            />
          </Tooltip>
        </VStack>
      </Box>
    );
  };

  // 일정 관리 사이드바 렌더링
  const renderScheduleSidebar = () => {
    const today = new Date();
    const selectedKey = format(selectedDate, 'yyyy-MM-dd');
    const todayEvents = interviewEvents[selectedKey];

    // 날짜 기준 분리
    const upcoming = [];
    const past = [];

    Object.entries(interviewEvents).forEach(([dateStr, items]) => {
      const date = parseISO(dateStr);
      if (isAfter(date, today)) {
        upcoming.push({ date, items });
      } else if (isBefore(date, today)) {
        past.push({ date, items });
      }
    });

    // 정렬
    upcoming.sort((a, b) => compareAsc(a.date, b.date));
    past.sort((a, b) => compareAsc(b.date, a.date));

    return (
      <aside className="sticky top-16 self-start w-[290px] max-w-[290px] bg-[#eef6ff] dark:bg-gray-900 text-gray-900 dark:text-gray-200 rounded-lg space-y-4 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
        {/* My 일정 Block */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 p-3">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-200 text-left">My 일정</h2>
          <div className="flex justify-center">
            <DatePicker
              selected={selectedDate}
              onChange={setSelectedDate}
              inline
              locale={ko}
              calendarClassName="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow"
              wrapperClassName="w-full"
              dayClassName={(date) => {
                const key = format(date, 'yyyy-MM-dd');
                return interviewEvents[key]
                  ? 'relative after:content-[""] after:absolute after:w-1.5 after:h-1.5 after:rounded-full after:bg-red-500 after:bottom-1 after:left-1/2 after:-translate-x-1/2'
                  : '';
              }}
            />
          </div>

          <div className="mt-4">
            <p className="font-semibold mb-2 text-sm text-gray-700 dark:text-gray-200">
              {selectedDate.toLocaleDateString()} 일정
            </p>
            {todayEvents ? (
              todayEvents.map((event, idx) => (
                <div key={idx} className="p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded shadow text-xs mb-2">
                  <p>{event.name} 지원자</p>
                  <p>{event.role}</p>
                  <p>{event.time}</p>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400">일정 없음</p>
            )}
          </div>
        </div>

        {/* 면접 일정 Block */}
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-200 text-left">면접 일정</h2>
          <div className="text-sm space-y-3">
            {/* 다음 면접 */}
            <div>
              <p className="text-gray-900 dark:text-gray-300 font-medium mb-1">다음 면접</p>
              <div className="space-y-2">
                {upcoming.length > 0 ? (
                  upcoming.map(({ date, items }, idx) => (
                    <div key={idx}>
                      {items.map((event, i) => (
                        <div key={i} className="p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded shadow text-xs mb-2">
                          <p>{event.name} 지원자</p>
                          <p>{event.role}</p>
                          <p>{format(date, 'MM.dd(E)', { locale: ko })} {event.time}</p>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">예정된 면접 없음</p>
                )}
              </div>
            </div>

            {/* 지난 면접 */}
            <div>
              <p className="text-gray-900 dark:text-gray-300 font-medium mb-1">지난 면접</p>
              <div className="space-y-2">
                {past.length > 0 ? (
                  past.map(({ date, items }, idx) => (
                    <div key={idx}>
                      {items.map((event, i) => (
                        <div key={i} className="p-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded shadow text-xs mb-2">
                          <p>{event.name} 지원자</p>
                          <p>{event.role}</p>
                          <p>{format(date, 'MM.dd(E)', { locale: ko })} {event.time}</p>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-gray-400">지난 면접 없음</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    );
  };

  // 지원자 관리 사이드바 렌더링 (예시)
  const renderApplicantSidebar = () => {
    return (
      <aside className="sticky top-16 self-start w-[290px] max-w-[290px] bg-[#eef6ff] dark:bg-gray-900 text-gray-900 dark:text-gray-200 rounded-lg space-y-4 max-h-[calc(100vh-3.5rem)] overflow-y-auto">
        <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-300 dark:border-gray-600 p-4">
          <h2 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-200 text-left">지원자 필터</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">지원 상태</label>
              <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="">전체</option>
                <option value="pending">대기중</option>
                <option value="interview">면접중</option>
                <option value="passed">합격</option>
                <option value="rejected">불합격</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">지원 분야</label>
              <select className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                <option value="">전체</option>
                <option value="frontend">프론트엔드</option>
                <option value="backend">백엔드</option>
                <option value="fullstack">풀스택</option>
              </select>
            </div>
          </div>
        </div>
      </aside>
    );
  };

  // 조건부 렌더링
  switch (type) {
    case 'navigation':
      return renderNavigationSidebar();
    case 'schedule':
      return renderScheduleSidebar();
    case 'applicant':
      return renderApplicantSidebar();
    default:
      return renderNavigationSidebar();
  }
} 