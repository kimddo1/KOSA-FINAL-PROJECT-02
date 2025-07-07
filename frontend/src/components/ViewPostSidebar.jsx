import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, VStack, Button, IconButton, useColorModeValue, Tooltip, Text } from '@chakra-ui/react';
import { CiHome, CiSettings, CiUser, CiCalendar } from 'react-icons/ci';
import { MdOutlinePlayCircle, MdOutlineDescription, MdCheckCircle, MdRadioButtonUnchecked } from 'react-icons/md';

export default function ViewPostSidebar({ jobPost }) {
  const navigate = useNavigate();
  const { jobPostId: urlJobPostId } = useParams();
  const [isHovered, setIsHovered] = useState(false);
  const headerHeight = 64; // 실제 헤더 높이(px)로 맞추세요!
  const sidebarBg = useColorModeValue('white', '#1a202c');
  const borderColor = useColorModeValue('#e2e8f0', '#2d3748');

  // jobPostId 우선순위: URL 파라미터 > jobPost.id
  const effectiveJobPostId = urlJobPostId || jobPost?.id;
  
  console.log('ViewPostSidebar Debug:', {
    urlJobPostId,
    jobPostId: jobPost?.id,
    effectiveJobPostId,
    jobPost: jobPost
  });

  // 보고서 등록 여부 (props로 전달, 예시)
  const interviewReportDone = jobPost?.interviewReportDone;
  const finalReportDone = jobPost?.finalReportDone;

  // jobPost가 없으면 사이드바를 렌더링하지 않음
  if (!jobPost) {
    return null;
  }

  return (
    <Box
      position="fixed"
      left={0}
      top={`${headerHeight}px`}
      w={isHovered ? "180px" : "90px"}
      h={`calc(100vh - ${headerHeight}px)`}
      bg={sidebarBg}
      borderRight={`1px solid ${borderColor}`}
      zIndex={900} // 헤더보다 낮게!
      pt={4}
      boxShadow="md"
      display="flex"
      flexDirection="column"
      alignItems={isHovered ? "flex-start" : "center"}
      justifyContent="flex-start"
      transition="all 0.3s cubic-bezier(.4,0,.2,1)"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      pl={isHovered ? 4 : 0}
      pr={isHovered ? 4 : 0}
    >
      {/* 공고 정보 */}
      <Box w="full" mb={4} px={isHovered ? 1 : 0}>
        <Text fontWeight="bold" fontSize={isHovered ? 'md' : 'sm'} noOfLines={2} mb={1}>
          {jobPost?.title || '공고 제목'}
        </Text>
        <Text fontSize="xs" color="gray.400" noOfLines={1}>
          {jobPost?.startDate} ~ {jobPost?.endDate}
        </Text>
      </Box>
      {/* Flowchart 네비게이션 */}
      <VStack spacing={0} align="stretch" w="full" mb={6}>
        <Button
          w={isHovered ? "full" : "60px"}
          h="44px"
          variant="ghost"
          onClick={() => navigate(`/applicantlist/${effectiveJobPostId}`)}
          fontSize="sm"
          justifyContent={isHovered ? "flex-start" : "center"}
          alignItems="center"
          color={useColorModeValue('gray.700', 'white')}
          fontWeight="semibold"
          borderRadius="md"
          p={0}
          pl={isHovered ? 2 : 0}
        >
          {isHovered && <Text ml={2}>지원자 조회</Text>}
        </Button>
        <Box h="18px" borderLeft="2px solid #e2e8f0" ml={isHovered ? 6 : 2} />
        <Button
          w={isHovered ? "full" : "60px"}
          h="44px"
          variant="ghost"
          onClick={() => navigate(`/passedapplicants/${effectiveJobPostId}`)}
          fontSize="sm"
          justifyContent={isHovered ? "flex-start" : "center"}
          alignItems="center"
          color={useColorModeValue('gray.700', 'white')}
          fontWeight="semibold"
          borderRadius="md"
          p={0}
          pl={isHovered ? 2 : 0}
        >
          {isHovered && <Text ml={2}>서류 합격자 명단</Text>}
        </Button>
        <Box h="18px" borderLeft="2px solid #e2e8f0" ml={isHovered ? 6 : 2} />
        <Button
          w={isHovered ? "full" : "60px"}
          h="44px"
          variant="ghost"
          onClick={() => navigate(`/interview-progress/${effectiveJobPostId}`)}
          leftIcon={<MdOutlinePlayCircle size={22} />}
          fontSize="sm"
          justifyContent={isHovered ? "flex-start" : "center"}
          alignItems="center"
          color={useColorModeValue('blue.600', 'blue.200')}
          fontWeight="bold"
          borderRadius="md"
          p={0}
          pl={isHovered ? 2 : 0}
        >
          {isHovered && <Text ml={2}>면접 진행</Text>}
        </Button>
      </VStack>
      {/* 보고서 버튼들 */}
      <VStack spacing={1} align="stretch" w="full" mb={6}>
        <Button
          w={isHovered ? "full" : "60px"}
          h="36px"
          variant="ghost"
          onClick={() => interviewReportDone && navigate('/interview-report')}
          leftIcon={interviewReportDone ? <MdCheckCircle size={18} color="#3182ce" /> : <MdRadioButtonUnchecked size={18} color="#cbd5e1" />}
          fontSize="sm"
          justifyContent={isHovered ? "flex-start" : "center"}
          alignItems="center"
          color={interviewReportDone ? useColorModeValue('blue.600', 'blue.200') : 'gray.400'}
          fontWeight="normal"
          borderRadius="md"
          p={0}
          pl={isHovered ? 8 : 6}
          isDisabled={!interviewReportDone}
          _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
        >
          {isHovered && <Text ml={2} fontSize="sm">면접 보고서</Text>}
        </Button>
        <Button
          w={isHovered ? "full" : "60px"}
          h="36px"
          variant="ghost"
          onClick={() => finalReportDone && navigate('/final-report')}
          leftIcon={finalReportDone ? <MdCheckCircle size={18} color="#3182ce" /> : <MdRadioButtonUnchecked size={18} color="#cbd5e1" />}
          fontSize="sm"
          justifyContent={isHovered ? "flex-start" : "center"}
          alignItems="center"
          color={finalReportDone ? useColorModeValue('blue.600', 'blue.200') : 'gray.400'}
          fontWeight="normal"
          borderRadius="md"
          p={0}
          pl={isHovered ? 8 : 6}
          isDisabled={!finalReportDone}
          _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
        >
          {isHovered && <Text ml={2} fontSize="sm">최종 보고서</Text>}
        </Button>
      </VStack>
      {/* 하단 네비게이션 (예시) */}
      <VStack spacing={2} mb={4} w="full">
        <Button
          w={isHovered ? "full" : "40px"}
          h="40px"
          variant="ghost"
          onClick={() => navigate('/memberschedule')}
          leftIcon={<CiCalendar size={22} />}
          fontSize="sm"
          justifyContent={isHovered ? "flex-start" : "center"}
          alignItems="center"
          p={0}
          color={useColorModeValue('gray.700', 'white')}
          pl={isHovered ? 2 : 0}
        >
          {isHovered && <Text ml={2} fontSize="sm">면접 응답</Text>}
        </Button>
        <Button
          w={isHovered ? "full" : "40px"}
          h="40px"
          variant="ghost"
          onClick={() => navigate('/settings')}
          leftIcon={<CiSettings size={22} />}
          fontSize="sm"
          justifyContent={isHovered ? "flex-start" : "center"}
          alignItems="center"
          p={0}
          color={useColorModeValue('gray.700', 'white')}
          pl={isHovered ? 2 : 0}
        >
          {isHovered && <Text ml={2} fontSize="sm">설정</Text>}
        </Button>
        <Button
          w={isHovered ? "full" : "40px"}
          h="40px"
          variant="ghost"
          onClick={() => navigate('/mypage')}
          leftIcon={<CiUser size={22} />}
          fontSize="sm"
          justifyContent={isHovered ? "flex-start" : "center"}
          alignItems="center"
          p={0}
          color={useColorModeValue('gray.700', 'white')}
          pl={isHovered ? 2 : 0}
        >
          {isHovered && <Text ml={2} fontSize="sm">내 정보</Text>}
        </Button>
      </VStack>
    </Box>
  );
} 