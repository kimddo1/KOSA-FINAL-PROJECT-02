import React from 'react';
import { Box, VStack, Button, useColorModeValue, Tooltip } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { CiHome } from 'react-icons/ci';

export default function SidebarNav() {
  const navigate = useNavigate();
  const sidebarBg = useColorModeValue('#61dafbaa', '#23272f');
  return (
    <Box
      position="fixed"
      left={0}
      top={0}
      w="80px"
      minW="80px"
      maxW="80px"
      h="100vh"
      bg={sidebarBg}
      borderRight="2px solid #61dafb"
      zIndex={9999}
      pt={4}
      boxShadow="2xl"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <VStack spacing={4}>
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
          >
            {/* 아이콘만 보이게, 텍스트는 생략 */}
          </Button>
        </Tooltip>
      </VStack>
    </Box>
  );
} 