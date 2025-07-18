# 실시간 면접 시스템 테스트 가이드

## 개요

실시간 면접 시스템은 WebSocket을 통한 실시간 통신과 AI 기반 음성 인식, 화자 분리, 평가 기능을 제공합니다.

### 주요 기능

- **실시간 WebSocket 통신**: 면접 세션 중 실시간 데이터 전송
- **음성 인식**: 한국어 음성을 텍스트로 변환
- **화자 분리**: 6명의 참가자(면접관 3명, 지원자 3명) 구분
- **AI 평가**: 실시간 면접 내용 분석 및 점수 제공
- **화자별 메모**: 면접관이 지원자에 대한 메모 작성

## 테스트 환경 설정

### 1. Docker 컨테이너 상태 확인

```bash
# 모든 컨테이너가 실행 중인지 확인
docker ps

# 예상 결과:
# kocruit_fastapi    - FastAPI 서버 (포트 8000)
# kocruit_agent      - AI Agent 서버 (포트 8001)
# kocruit_react      - React 프론트엔드 (포트 5173)
# kosa-redis         - Redis 캐시 (포트 6379)
```

### 2. 의존성 확인

```bash
# FastAPI 서버에 websockets 라이브러리 설치 확인
docker exec -it kocruit_fastapi pip list | grep websockets

# 설치되지 않은 경우
docker exec -it kocruit_fastapi pip install websockets
docker restart kocruit_fastapi
```

## 테스트 실행

### 1. 테스트 스크립트 복사

```bash
# agent 폴더에서 실행
docker cp agent/test_realtime_interview.py kocruit_agent:/app/
```

### 2. 테스트 실행

```bash
# Agent 컨테이너에서 테스트 실행
docker exec -it kocruit_agent python test_realtime_interview.py
```

### 3. 예상 결과

```
🚀 실시간 면접 시스템 테스트 시작
==================================================
🔄 WebSocket 연결 시도: ws://kocruit_fastapi:8000/api/v1/realtime-interview/ws/interview/test_session_xxx
✅ WebSocket 연결 성공!

📝 화자 메모 테스트...
📨 메모 응답: {"type": "note_saved", "speaker": "면접관_1", "note": "지원자의 기술적 배경이 인상적입니다.", ...}

⭐ 평가 요청 테스트...
📨 평가 응답: {"type": "evaluation_summary", "summary": {...}}

🎤 가짜 오디오 청크 테스트...
📨 오디오 처리 응답: {"type": "audio_processed", "result": {...}}

🔚 세션 종료 테스트...
📨 세션 종료 응답: {"type": "session_ended", "final_result": {...}}

✅ 모든 테스트 완료!

🔄 세션 상태 조회 테스트: http://kocruit_fastapi:8000/api/v1/realtime-interview/interview/session/xxx/status
✅ 예상된 404 응답 (존재하지 않는 세션)

==================================================
🏁 테스트 완료!
```

## 테스트 항목 상세 설명

### 1. WebSocket 연결 테스트
- **목적**: 실시간 통신 채널 연결 확인
- **기대 결과**: 연결 성공 메시지
- **실패 시**: 네트워크 연결 및 서버 상태 확인

### 2. 화자 메모 테스트
- **목적**: 면접관이 지원자에 대한 메모 작성 기능
- **테스트 데이터**: "지원자의 기술적 배경이 인상적입니다."
- **기대 결과**: 메모 저장 확인 응답

### 3. 평가 요청 테스트
- **목적**: AI가 실시간으로 면접 내용을 평가하는 기능
- **기대 결과**: 세션 요약 정보 (통계, 점수 등)

### 4. 오디오 청크 테스트
- **목적**: 실시간 음성 데이터 처리 기능
- **처리 과정**: 
  1. 음성 인식 (한국어 → 텍스트)
  2. 화자 분리 (6명 중 1명 식별)
  3. AI 평가 (키워드 분석, 점수 계산)
- **기대 결과**: 처리된 오디오 데이터와 평가 결과

### 5. 세션 종료 테스트
- **목적**: 면접 세션 정리 및 결과 저장
- **기대 결과**: 전체 세션 요약 (트랜스크립트, 평가, 메모)

### 6. 세션 상태 조회 테스트
- **목적**: HTTP API를 통한 세션 정보 조회
- **기대 결과**: 404 응답 (테스트 세션은 임시이므로)

## 문제 해결

### WebSocket 연결 실패

**증상**: `server rejected WebSocket connection: HTTP 404`
```bash
# 해결 방법
docker exec -it kocruit_fastapi pip install websockets
docker restart kocruit_fastapi
```

**증상**: `server rejected WebSocket connection: HTTP 403`
```bash
# 해결 방법
# 1. WebSocket 경로 확인
# 2. FastAPI 라우터 등록 확인
docker logs kocruit_fastapi --tail=20
```

### 컨테이너 간 통신 오류

**증상**: `Connect call failed`
```bash
# 해결 방법
# 1. 모든 컨테이너가 실행 중인지 확인
docker ps

# 2. 네트워크 연결 확인
docker network ls
docker network inspect kosa-final-project-02_app-net
```

### 의존성 오류

**증상**: `ModuleNotFoundError`
```bash
# 해결 방법
# 1. requirements.txt 확인
docker exec -it kocruit_agent pip list

# 2. 필요한 패키지 설치
docker exec -it kocruit_agent pip install missing_package
```

## 실제 사용 시나리오

### 1. 면접 패널 페이지 접속
- 프론트엔드: http://localhost:5173
- 면접 패널 페이지로 이동

### 2. WebSocket 연결
- 브라우저에서 자동으로 WebSocket 연결
- 실시간 통신 준비 완료

### 3. 오디오 녹음 시작
- 마이크 권한 허용
- 실시간 오디오 스트리밍 시작

### 4. AI 평가 모니터링
- 실시간 음성 인식 결과 확인
- 화자별 발화 내용 확인
- AI 평가 점수 및 피드백 확인

### 5. 면접관 메모 작성
- 지원자별 메모 작성
- 실시간 저장 및 공유

## API 엔드포인트

### WebSocket 엔드포인트
```
ws://localhost:8000/api/v1/realtime-interview/ws/interview/{session_id}
```

### HTTP 엔드포인트
```
GET /api/v1/realtime-interview/interview/session/{session_id}/status
```

## 관련 파일

- `test_realtime_interview.py`: 테스트 스크립트
- `backend/app/api/v1/realtime_interview.py`: WebSocket API 구현
- `agent/tools/realtime_interview_evaluation_tool.py`: AI 평가 도구
- `agent/tools/speaker_diarization_tool.py`: 화자 분리 도구
- `frontend/src/pages/applicant/InterviewPanel.jsx`: 프론트엔드 구현

## 추가 정보

- **지원 언어**: 한국어
- **화자 수**: 최대 6명 (면접관 3명, 지원자 3명)
- **평가 항목**: 기술, 경험, 인성, 동기
- **실시간 처리**: 30초 간격으로 AI 평가 수행 