import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Avatar,
  Badge,
  Flex,
  Divider,
  useColorModeValue,
  SlideFade,
  ScaleFade,
  Icon,
  useToast
} from '@chakra-ui/react';
import {
  ChatIcon,
  CloseIcon,
  ArrowForwardIcon
} from '@chakra-ui/icons';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

// 챗봇 전용 axios 인스턴스
const chatbotApi = axios.create({
  baseURL: 'http://localhost:8001',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

const Chatbot = () => {
  // 모든 훅을 최상단에 배치 (순서 중요!)
  const location = useLocation();
  const toast = useToast();
  
  // useState 훅들
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "안녕하세요! 코크루트 챗봇입니다. 무엇을 도와드릴까요?",
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatSize, setChatSize] = useState({ width: 400, height: 500 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [sessionId, setSessionId] = useState(null);
  
  // useRef 훅들
  const messagesEndRef = useRef(null);
  const chatRef = useRef(null);

  // useColorModeValue 훅들
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const userMessageBg = useColorModeValue('blue.500', 'blue.400');
  const botMessageBg = useColorModeValue('gray.100', 'gray.700');
  const messageAreaBg = useColorModeValue('gray.50', 'gray.900');

  const quickReplies = [
    "채용공고 등록 방법",
    "지원자 관리",
    "면접 일정 관리",
    "주요 기능 안내"
  ];

  // 페이지 컨텍스트 수집
  const getPageContext = () => {
    const context = {
      pathname: location.pathname,
      search: location.search,
      pageTitle: document.title,
      timestamp: new Date().toISOString()
    };

    // 주요 DOM 요소들 수집
    try {
      const forms = Array.from(document.querySelectorAll('form')).map(form => ({
        id: form.id || null,
        className: form.className || null,
        action: form.action || null
      }));

      const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(input => ({
        id: input.id || null,
        name: input.name || null,
        type: input.type || input.tagName.toLowerCase(),
        placeholder: input.placeholder || null,
        value: input.value || null,
        className: input.className || null
      }));

      const buttons = Array.from(document.querySelectorAll('button')).map(button => ({
        id: button.id || null,
        text: button.textContent?.trim() || null,
        className: button.className || null
      }));

      context.domElements = {
        forms: forms.slice(0, 5), // 최대 5개만
        inputs: inputs.slice(0, 10), // 최대 10개만
        buttons: buttons.slice(0, 10) // 최대 10개만
      };
    } catch (error) {
      console.warn('DOM 요소 수집 중 오류:', error);
      context.domElements = { forms: [], inputs: [], buttons: [] };
    }

    return context;
  };

  // 페이지별 설명 매핑
  const getPageDescription = (pathname) => {
    const pageMap = {
      '/': '메인 홈페이지',
      '/login': '로그인 페이지',
      '/signup': '회원가입 페이지',
      '/joblist': '채용공고 목록 페이지',
      '/mypage': '마이페이지',
      '/corporatehome': '기업 홈페이지',
      '/applicantlist': '지원자 목록 페이지',
      '/postrecruitment': '채용공고 등록 페이지',
      '/email': '이메일 발송 페이지',
      '/managerschedule': '매니저 일정 관리 페이지',
      '/memberschedule': '멤버 일정 관리 페이지'
    };
    return pageMap[pathname] || '알 수 없는 페이지';
  };

  // 세션 초기화
  useEffect(() => {
    if (isOpen && !sessionId) {
      initializeSession();
    }
  }, [isOpen, sessionId]);

  const initializeSession = async () => {
    try {
      const response = await chatbotApi.get('/chat/session/new');
      if (response.data.session_id) {
        setSessionId(response.data.session_id);
        console.log('새 세션 생성:', response.data.session_id);
      }
    } catch (error) {
      console.error('세션 생성 실패:', error);
      toast({
        title: "연결 오류",
        description: "챗봇 서버에 연결할 수 없습니다.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 크기 조절 이벤트 리스너
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, resizeStart, resizeDirection]);

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
    handleSendMessage(reply);
  };

  const handleSendMessage = async (customMessage = null) => {
    const messageToSend = customMessage || inputMessage;
    if (messageToSend.trim() === '') return;

    const userMessage = {
      id: messages.length + 1,
      text: messageToSend,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // 페이지 컨텍스트 수집
      const pageContext = getPageContext();
      
      // 에이전트 API 호출 (페이지 컨텍스트 포함)
      const response = await chatbotApi.post('/chat/', {
        session_id: sessionId,
        message: messageToSend,
        page_context: pageContext
      });

      if (response.data.ai_response) {
        const botResponse = {
          id: messages.length + 2,
          text: response.data.ai_response,
          sender: 'bot',
          timestamp: new Date(),
          pageSuggestions: response.data.page_suggestions || [],
          domActions: response.data.dom_actions || []
        };
        setMessages(prev => [...prev, botResponse]);
        
        // 페이지 제안이나 DOM 액션이 있다면 처리
        if (response.data.page_suggestions) {
          console.log('페이지 제안:', response.data.page_suggestions);
        }
        if (response.data.dom_actions) {
          console.log('DOM 액션:', response.data.dom_actions);
          // 여기서 DOM 액션을 실행할 수 있습니다
        }
      } else {
        throw new Error('응답이 없습니다.');
      }
    } catch (error) {
      console.error('챗봇 API 호출 실패:', error);
      
      // 에러 메시지 표시
      const errorMessage = {
        id: messages.length + 2,
        text: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "연결 오류",
        description: "챗봇 서버에 연결할 수 없습니다.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // 크기 조절 시작
  const handleResizeStart = (e, direction) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: chatSize.width,
      height: chatSize.height
    });
  };

  // 크기 조절 중
  const handleResizeMove = (e) => {
    if (!isResizing) return;

    const deltaX = e.clientX - resizeStart.x;
    const deltaY = e.clientY - resizeStart.y;
    
    let newWidth = resizeStart.width;
    let newHeight = resizeStart.height;

    // 방향에 따라 크기 조절
    if (resizeDirection.includes('right')) {
      newWidth = Math.max(300, Math.min(800, resizeStart.width + deltaX));
    }
    if (resizeDirection.includes('left')) {
      newWidth = Math.max(300, Math.min(800, resizeStart.width - deltaX));
    }
    if (resizeDirection.includes('bottom')) {
      newHeight = Math.max(400, Math.min(800, resizeStart.height + deltaY));
    }
    if (resizeDirection.includes('top')) {
      newHeight = Math.max(400, Math.min(800, resizeStart.height - deltaY));
    }

    setChatSize({ width: newWidth, height: newHeight });
  };

  // 크기 조절 종료
  const handleResizeEnd = () => {
    setIsResizing(false);
    setResizeDirection('');
  };

  return (
    <Box position="fixed" bottom={4} right={4} zIndex={1000}>
      {/* 챗봇 토글 버튼 - 채팅창이 열려있을 때는 숨김 */}
      <ScaleFade in={!isOpen}>
        <Button
          onClick={() => setIsOpen(true)}
          colorScheme="blue"
          size="lg"
          borderRadius="full"
          boxShadow="lg"
          _hover={{ transform: 'scale(1.1)' }}
          transition="all 0.3s"
        >
          <ChatIcon />
        </Button>
      </ScaleFade>

      {/* 챗봇 채팅창 */}
      <SlideFade in={isOpen} offsetY="20px">
        {isOpen && (
          <Box
            ref={chatRef}
            position="absolute"
            bottom={4}
            right={0}
            w={`${chatSize.width}px`}
            h={`${chatSize.height}px`}
            bg={bgColor}
            borderRadius="lg"
            boxShadow="xl"
            border="1px"
            borderColor={borderColor}
            display="flex"
            flexDirection="column"
            userSelect="none"
          >
            {/* 헤더 */}
            <Box
              bgGradient="linear(to-r, blue.500, blue.600)"
              color="white"
              p={4}
              borderTopRadius="lg"
            >
              <Flex align="center" justify="space-between">
                <Flex align="center" gap={2}>
                  <Avatar size="sm" bg="white" color="blue.500" icon={<ChatIcon />} />
                  <Box>
                    <Text fontWeight="semibold">코크루트 챗봇</Text>
                    <Text fontSize="sm" opacity={0.8}>
                      {sessionId ? `${getPageDescription(location.pathname)} - AI 연결됨` : '연결 중...'}
                    </Text>
                  </Box>
                </Flex>
                <IconButton
                  icon={<CloseIcon />}
                  onClick={() => setIsOpen(false)}
                  size="sm"
                  variant="ghost"
                  color="white"
                  _hover={{ bg: 'whiteAlpha.200' }}
                />
              </Flex>
            </Box>

            {/* 메시지 영역 */}
            <VStack
              flex={1}
              overflowY="auto"
              p={4}
              spacing={3}
              bg={messageAreaBg}
            >
              {messages.map((message) => (
                <Box
                  key={message.id}
                  alignSelf={message.sender === 'user' ? 'flex-end' : 'flex-start'}
                  maxW="80%"
                >
                  <Box
                    bg={message.sender === 'user' ? userMessageBg : 
                        message.isError ? 'red.100' : botMessageBg}
                    color={message.sender === 'user' ? 'white' : 
                           message.isError ? 'red.800' : 'inherit'}
                    p={3}
                    borderRadius="lg"
                    boxShadow="sm"
                  >
                    <Text fontSize="sm" whiteSpace="pre-line">
                      {message.text}
                    </Text>
                    <Text fontSize="xs" opacity={0.7} mt={1}>
                      {message.timestamp.toLocaleTimeString()}
                    </Text>
                  </Box>
                </Box>
              ))}

              {/* 타이핑 인디케이터 */}
              {isTyping && (
                <Box alignSelf="flex-start" maxW="80%">
                  <Box bg={botMessageBg} p={3} borderRadius="lg" boxShadow="sm">
                    <HStack spacing={1}>
                      <Box
                        w={2}
                        h={2}
                        bg="gray.400"
                        borderRadius="full"
                        sx={{
                          animation: 'bounce 1.4s infinite ease-in-out',
                          animationDelay: '0s'
                        }}
                      />
                      <Box
                        w={2}
                        h={2}
                        bg="gray.400"
                        borderRadius="full"
                        sx={{
                          animation: 'bounce 1.4s infinite ease-in-out',
                          animationDelay: '0.16s'
                        }}
                      />
                      <Box
                        w={2}
                        h={2}
                        bg="gray.400"
                        borderRadius="full"
                        sx={{
                          animation: 'bounce 1.4s infinite ease-in-out',
                          animationDelay: '0.32s'
                        }}
                      />
                    </HStack>
                  </Box>
                </Box>
              )}

              {/* 빠른 응답 버튼들 */}
              {messages.length === 1 && !isTyping && sessionId && (
                <HStack spacing={2} flexWrap="wrap" justify="flex-start" w="100%">
                  {quickReplies.map((reply, index) => (
                    <Badge
                      key={index}
                      colorScheme="blue"
                      variant="outline"
                      cursor="pointer"
                      _hover={{ bg: 'blue.50' }}
                      onClick={() => handleQuickReply(reply)}
                      p={2}
                      borderRadius="full"
                    >
                      {reply}
                    </Badge>
                  ))}
                </HStack>
              )}

              <div ref={messagesEndRef} />
            </VStack>

            <Divider />

            {/* 입력 영역 */}
            <Box p={4} bg={bgColor}>
              <HStack spacing={2}>
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={sessionId ? "메시지를 입력하세요..." : "연결 중..."}
                  disabled={isTyping || !sessionId}
                  size="sm"
                />
                <IconButton
                  colorScheme="blue"
                  onClick={() => handleSendMessage()}
                  disabled={inputMessage.trim() === '' || isTyping || !sessionId}
                  icon={<ArrowForwardIcon />}
                  size="sm"
                  _hover={{ transform: 'scale(1.1)' }}
                  transition="all 0.2s"
                />
              </HStack>
            </Box>

            {/* 크기 조절 핸들들 */}
            {/* 우하단 핸들 */}
            <Box
              position="absolute"
              bottom={0}
              right={0}
              w="12px"
              h="12px"
              cursor="nw-resize"
              onMouseDown={(e) => handleResizeStart(e, 'bottom-right')}
              bg="transparent"
              _hover={{ bg: 'blue.500' }}
              borderRadius="0 0 8px 0"
              zIndex={10}
            />
            
            {/* 좌하단 핸들 */}
            <Box
              position="absolute"
              bottom={0}
              left={0}
              w="12px"
              h="12px"
              cursor="ne-resize"
              onMouseDown={(e) => handleResizeStart(e, 'bottom-left')}
              bg="transparent"
              _hover={{ bg: 'blue.500' }}
              borderRadius="0 0 0 8px"
              zIndex={10}
            />
            
            {/* 우상단 핸들 */}
            <Box
              position="absolute"
              top={0}
              right={0}
              w="12px"
              h="12px"
              cursor="sw-resize"
              onMouseDown={(e) => handleResizeStart(e, 'top-right')}
              bg="transparent"
              _hover={{ bg: 'blue.500' }}
              borderRadius="0 8px 0 0"
              zIndex={10}
            />
            
            {/* 좌상단 핸들 */}
            <Box
              position="absolute"
              top={0}
              left={0}
              w="12px"
              h="12px"
              cursor="se-resize"
              onMouseDown={(e) => handleResizeStart(e, 'top-left')}
              bg="transparent"
              _hover={{ bg: 'blue.500' }}
              borderRadius="8px 0 0 0"
              zIndex={10}
            />
          </Box>
        )}
      </SlideFade>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </Box>
  );
};

export default Chatbot; 