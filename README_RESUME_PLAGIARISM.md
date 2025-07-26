# 이력서 표절 검사 시스템

OpenAI의 `text-embedding-3-small` 모델과 ChromaDB를 사용하여 이력서 표절을 검사하는 시스템입니다.

## 🎯 주요 기능

- **이력서 임베딩**: OpenAI text-embedding-3-small 모델로 이력서 내용을 벡터화
- **벡터 저장**: ChromaDB에 임베딩 벡터와 메타데이터 저장
- **유사도 검색**: 새로운 이력서와 기존 이력서들의 유사도 비교
- **표절 검사**: 유사도 임계값(기본 0.9) 이상일 때 표절 의심 표시
- **일괄 처리**: 기존 이력서들의 일괄 임베딩 지원

## 🏗️ 시스템 구조

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Resume DB     │    │  OpenAI API     │    │   ChromaDB      │
│   (MySQL)       │    │  (Embedding)    │    │   (Vector DB)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              Resume Plagiarism Service                          │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ OpenAIEmbedder  │  │ ChromaDBManager │  │ Plagiarism      │ │
│  │                 │  │                 │  │ Detection       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FastAPI Endpoints                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ /check-plagiarism│  │ /embed-resume   │  │ /batch-embed    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## 📦 설치 및 설정

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. 환경변수 설정

`.env` 파일에 OpenAI API 키를 설정하세요:

```env
OPENAI_API_KEY=your_openai_api_key_here
```

### 3. ChromaDB 디렉토리 생성

```bash
mkdir -p ./chroma_db
```

## 🚀 사용 방법

### 1. 시스템 테스트

```bash
cd backend/app/scripts
python test_resume_plagiarism.py
```

### 2. 기존 이력서 임베딩 초기화

```bash
# 모든 이력서 임베딩
python initialize_resume_embeddings.py --force

# 배치 크기 지정
python initialize_resume_embeddings.py --batch-size 20 --force

# 기존 임베딩 삭제
python initialize_resume_embeddings.py --clear --force
```

### 3. API 사용 예시

#### 표절 검사

```python
import requests

# 새로운 이력서 내용으로 표절 검사
response = requests.post("http://localhost:8000/api/v1/resume-plagiarism/check-plagiarism", json={
    "resume_content": "안녕하세요. 저는 소프트웨어 개발자입니다...",
    "resume_id": 101,
    "similarity_threshold": 0.9
})

result = response.json()
print(result)
```

#### 특정 이력서 표절 검사

```python
# 데이터베이스의 이력서 ID로 표절 검사
response = requests.post("http://localhost:8000/api/v1/resume-plagiarism/check-resume/101?similarity_threshold=0.9")
result = response.json()
print(result)
```

#### 이력서 임베딩

```python
# 특정 이력서 임베딩
response = requests.post("http://localhost:8000/api/v1/resume-plagiarism/embed-resume/101")
print(response.json())

# 일괄 임베딩
response = requests.post("http://localhost:8000/api/v1/resume-plagiarism/batch-embed", json={
    "resume_ids": [101, 102, 103]
})
print(response.json())
```

## 📋 API 엔드포인트

### 표절 검사

- `POST /api/v1/resume-plagiarism/check-plagiarism`
  - 새로운 이력서 내용으로 표절 검사
  - 요청: `{"resume_content": "...", "resume_id": 101, "similarity_threshold": 0.9}`

- `POST /api/v1/resume-plagiarism/check-resume/{resume_id}`
  - 데이터베이스의 특정 이력서로 표절 검사
  - 쿼리 파라미터: `similarity_threshold=0.9`

### 임베딩 관리

- `POST /api/v1/resume-plagiarism/embed-resume/{resume_id}`
  - 특정 이력서 임베딩

- `POST /api/v1/resume-plagiarism/batch-embed`
  - 여러 이력서 일괄 임베딩
  - 요청: `{"resume_ids": [101, 102, 103]}`

### 관리 기능

- `GET /api/v1/resume-plagiarism/collection-stats`
  - ChromaDB 컬렉션 통계 조회

- `DELETE /api/v1/resume-plagiarism/delete-embedding/{resume_id}`
  - 특정 이력서 임베딩 삭제

- `DELETE /api/v1/resume-plagiarism/clear-all-embeddings`
  - 모든 임베딩 삭제

- `GET /api/v1/resume-plagiarism/health`
  - 서비스 상태 확인

## 📊 응답 예시

### 표절 검사 결과

```json
{
    "input_resume_id": 101,
    "most_similar_resume": {
        "resume_id": 87,
        "user_id": 13,
        "title": "지원 동기",
        "similarity": 0.91
    },
    "plagiarism_suspected": true,
    "similarity_threshold": 0.9,
    "all_similar_resumes": [
        {
            "resume_id": 87,
            "user_id": 13,
            "title": "지원 동기",
            "similarity": 0.91
        },
        {
            "resume_id": 92,
            "user_id": 15,
            "title": "자기소개서",
            "similarity": 0.85
        }
    ]
}
```

### 일괄 임베딩 결과

```json
{
    "success": 8,
    "failed": 2,
    "total": 10
}
```

### 컬렉션 통계

```json
{
    "collection_name": "resumes",
    "total_resumes": 150,
    "persist_directory": "./chroma_db"
}
```

## 🔧 설정 옵션

### 유사도 임계값

- **0.9 (기본값)**: 높은 정확도, 낮은 오탐
- **0.8**: 중간 정확도, 중간 오탐
- **0.7**: 낮은 정확도, 높은 오탐

### 배치 크기

- **10 (기본값)**: 안정적인 처리
- **20-50**: 빠른 처리 (메모리 사용량 증가)
- **5**: 메모리 절약 (처리 시간 증가)

## 🛠️ 개발자 가이드

### 새로운 기능 추가

1. **서비스 레이어**: `backend/app/services/resume_plagiarism_service.py`
2. **API 엔드포인트**: `backend/app/api/v1/resume_plagiarism.py`
3. **유틸리티**: `backend/app/utils/` 디렉토리

### 로깅

시스템은 상세한 로깅을 제공합니다:

```python
import logging
logging.basicConfig(level=logging.INFO)
```

### 에러 처리

모든 API 엔드포인트는 적절한 HTTP 상태 코드와 에러 메시지를 반환합니다:

- `400`: 잘못된 요청
- `404`: 리소스를 찾을 수 없음
- `500`: 서버 내부 오류

## 🧪 테스트

### 단위 테스트

```bash
cd backend/app/scripts
python test_resume_plagiarism.py
```

### 통합 테스트

```bash
# 서버 시작
cd backend
uvicorn app.main:app --reload

# API 테스트
curl -X POST "http://localhost:8000/api/v1/resume-plagiarism/health"
```

## 📈 성능 최적화

### 임베딩 캐싱

- OpenAI API 호출 최소화를 위한 캐싱 구현
- 동일한 텍스트에 대한 중복 임베딩 방지

### 배치 처리

- 대량의 이력서 처리 시 배치 단위로 처리
- 메모리 사용량과 처리 속도 최적화

### 벡터 인덱싱

- ChromaDB의 자동 인덱싱 활용
- 빠른 유사도 검색 지원

## 🔒 보안 고려사항

1. **API 키 보안**: OpenAI API 키는 환경변수로 관리
2. **데이터 암호화**: ChromaDB 데이터는 로컬 저장
3. **접근 제어**: API 엔드포인트에 적절한 인증/인가 적용 필요

## 🐛 문제 해결

### 일반적인 문제

1. **OpenAI API 키 오류**
   - 환경변수 `OPENAI_API_KEY` 확인
   - API 키 유효성 검증

2. **ChromaDB 연결 오류**
   - 디렉토리 권한 확인
   - 디스크 공간 확인

3. **메모리 부족**
   - 배치 크기 줄이기
   - 시스템 리소스 확인

### 로그 확인

```bash
# 애플리케이션 로그
tail -f logs/app.log

# ChromaDB 로그
tail -f logs/chromadb.log
```

## 📞 지원

문제가 발생하면 다음을 확인하세요:

1. 로그 파일 확인
2. 시스템 요구사항 충족 여부
3. 환경변수 설정 확인
4. 네트워크 연결 상태 확인

---

**버전**: 1.0.0  
**최종 업데이트**: 2024년 12월  
**라이선스**: MIT 