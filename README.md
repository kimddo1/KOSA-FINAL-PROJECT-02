# KOSA-FINAL-PROJECT-02

```
myproject/
 ├─ backend/        # Spring Boot
 ├─ frontend/       # React + Vite
 ├─ agent/          # AI Agent (Python)
 ├─ initdb/         # 초기 DB 데이터(dump.sql 등)
 ├─ docker-compose.yml
 ├─ README.md
```

---

## 🚀 빠른 시작 (팀원용)

### 1. 환경 사전 준비
- Docker & Docker Compose 설치  
  [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)

### 2. 코드 내려받기
```bash
git clone https://github.com/your-org/kocruit-project.git
cd kocruit-project
```

### 3. Docker 실행
```bash
# 백그라운드에서 실행
docker-compose up -d

# 업데이트 포함하여 실행 (코드 변경 시)
docker-compose up --build

# 컨테이너 종료
docker-compose down

# 컨테이너 완전 정리
docker-compose down -v --remove-orphans
```

### 4. 서비스 접속
- **프론트엔드 (React)**: http://localhost:5173
- **백엔드 API (Spring Boot)**: http://localhost:8081  
- **데이터베이스 (MySQL)**: localhost:3307

---

## 🔄 완전 초기 설정 (처음 받는 사람용)

### 📋 사전 준비사항
- Docker Desktop 설치 및 실행
- Python 3.x 설치 (3.11.9 추천)
- pip 설치
- mysql-connector-python 패키지 설치: `pip install mysql-connector-python`

### 🔄 Docker 완전 초기화 및 실행 순서

#### 1. Docker Desktop 실행
```bash
# Mac에서 Docker Desktop 실행
open -a Docker
# 또는 Spotlight(⌘+Space)에서 "Docker" 검색 후 실행
```

#### 2. 기존 컨테이너/볼륨 완전 정리
```bash
# 프로젝트 루트 디렉토리에서 실행
docker-compose down -v
```

#### 3. Docker 컨테이너(서비스) 재시작
```bash
docker-compose up -d
```

#### 4. 서비스 상태 확인
```bash
docker ps
```
**예상 결과:**
- `mysql` 컨테이너: Up 상태 (healthy)
- `kocruit_springboot` 컨테이너: Up 상태  
- `kocruit_react` 컨테이너: Up 상태

#### 5. (필요시) DB 완전 초기화
```bash
# DB를 완전히 비우고 싶다면 실행
docker exec mysql mysql -u root -proot -e "DROP DATABASE IF EXISTS kocruit_db; CREATE DATABASE kocruit_db;"
```

#### 6. 테이블 스키마 생성
```bash
cd initdb
docker exec -i mysql mysql -u root -proot kocruit_db < 1_create_tables.sql
```

#### 7. 시드 데이터 입력
```bash
python3 2_seed_data.py
```

#### 8. 데이터 확인
```bash
docker exec mysql mysql -u root -proot -e "USE kocruit_db; SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'company', COUNT(*) FROM company UNION ALL SELECT 'jobpost', COUNT(*) FROM jobpost UNION ALL SELECT 'application', COUNT(*) FROM application UNION ALL SELECT 'resume', COUNT(*) FROM resume;"
```

---

## 🛠️ 개별 서비스 실행

### Docker의 MySQL에 접속하기
```bash
# 직접 MySQL 접속
docker exec -it mysql8 mysql -umyuser -p1234

# 또는 bash를 통한 접속
docker exec -it mysql bash
# bash-5.1# 나오면
mysql -u myuser -p
# Enter password: 입력 후
mysql> USE kocruit_db;
```

### 백엔드 에러 코드 보기
```bash
docker-compose logs backend
```

### 프론트엔드 (개별 실행)

처음 복제 했을 때, package.json 또는 package-lock.json이 수정 됐을 때
```bash
cd frontend
npm install
```

실행
```bash
npm run dev
```

→ 브라우저에서 `http://localhost:5173` 접속

#### PWA 설정
```bash
npm install vite-plugin-pwa --save-dev
npm install dayjs
```

### 백엔드 (개별 실행)

backend 디렉토리에 들어온 다음
```bash
./gradlew bootRun  # 또는
mvn spring-boot:run
```

### Agent 폴더 초기 세팅법

#### 1. 가상환경 생성 및 활성화
```bash
cd agent
python3 -m venv .venv

# macOS/Linux
source .venv/bin/activate

# Windows
# .venv\Scripts\activate
```

#### 2. 의존성 설치
```bash
pip install -r requirements.txt
```

#### 3. 환경변수 설정
```bash
# .env 파일 생성 및 설정
OPENAI_API_KEY=sk-...
```

#### 4. 서버 실행
```bash
uvicorn main:app --reload --port 8001
```

---

## ⚠️ 주의사항

### 경고 메시지 해석
시드 데이터 실행 시 다음과 같은 경고가 나타날 수 있습니다:
```
⚠️ 매핑 실패 - email: hong3007@example.com, company: KOSA바이오
⚠️ 사용자 ID를 찾을 수 없음: hong1044@example.com
```

이는 다음 중 하나의 이유입니다:
1. `company_user.json`에 있는 이메일이 `users.json`에 없음
2. `applicant_user_list.json`에 있는 이메일이 `users.json`에 없음

**해결 방법:**
- 경고 메시지는 무시해도 됩니다 (기본 기능에는 영향 없음)
- 완전한 데이터를 원한다면 `users.json`에 누락된 이메일들을 추가하세요

### 데이터 파일 구조 확인
- `users.json`: 사용자 정보 (email 필드 필수)
- `company.json`: 회사 정보
- `jobpost.json`: 채용공고 정보
- `application.json`: 지원서 정보
- `resume.json`: 이력서 정보
- `company_user.json`: 회사 직원 정보
- `applicant_user_list.json`: 지원자 목록

---

## 🛠️ 문제 해결

### Docker 데몬 연결 오류
```bash
# Docker Desktop이 실행되지 않은 경우
open -a Docker
# 잠시 기다린 후 다시 시도
```

### 포트 충돌
```bash
# 포트가 이미 사용 중인 경우
lsof -i :5173  # React 포트 확인
lsof -i :8081  # Spring Boot 포트 확인  
lsof -i :3307  # MySQL 포트 확인
```

### 데이터베이스 연결 오류
```bash
# MySQL 컨테이너 상태 확인
docker logs mysql
```

---

## 📊 예상 결과

성공적으로 완료되면 다음과 같은 데이터가 생성됩니다:
- **users**: 약 5,000명
- **company**: 13개 회사
- **jobpost**: 65개 채용공고
- **application**: 120개 지원서
- **resume**: 약 3,000개 이력서

---

## 🔧 추가 명령어

### 로그 확인
```bash
# Spring Boot 로그
docker logs kocruit_springboot

# React 로그  
docker logs kocruit_react

# MySQL 로그
docker logs mysql
```

### 컨테이너 재시작
```bash
# 특정 서비스만 재시작
docker-compose restart kocruit_springboot
docker-compose restart kocruit_react
docker-compose restart mysql
```

### 전체 서비스 중지
```bash
docker-compose down
```

---

## ✅ 완료 체크리스트

- [ ] Docker Desktop 실행
- [ ] 컨테이너 정상 실행 (`docker ps` 확인)
- [ ] 데이터베이스 스키마 생성
- [ ] 시드 데이터 입력 완료
- [ ] 프론트엔드 접속 가능 (http://localhost:5173)
- [ ] 백엔드 API 접속 가능 (http://localhost:8081)
- [ ] Agent 서버 실행 (http://localhost:8001)

모든 항목이 체크되면 프로젝트가 정상적으로 실행되고 있습니다! 🎉

---

## 📝 initdb 폴더 설명

initdb/ 폴더에 초기 덤프 또는 SQL 파일 넣기

initdb/ 경로는 컨테이너 최초 띄울 때 자동 실행되는 스크립트들이 저장되는 위치예요.

초기 테이블 생성이나 샘플 데이터가 있다면 dump.sql을 넣어두면 자동 반영됩니다.

