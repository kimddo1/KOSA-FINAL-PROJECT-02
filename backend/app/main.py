from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn

from app.core.config import settings
from app.api.v1.api import api_router
from app.core.database import engine
from app.models import Base


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    
    # 시드 데이터 실행
    try:
        import subprocess
        import os
        
        # 2_seed_data.py 파일이 있으면 실행
        seed_script_path = "/docker-entrypoint-initdb.d/2_seed_data.py"
        if os.path.exists(seed_script_path):
            print("시드 데이터 스크립트를 실행합니다...")
            result = subprocess.run(["python3", seed_script_path], 
                                  capture_output=True, text=True, check=True)
            print("시드 데이터 스크립트 실행 완료!")
            if result.stdout:
                print("출력:", result.stdout)
        else:
            print("시드 데이터 스크립트를 찾을 수 없습니다.")
            
    except Exception as e:
        print(f"시드 데이터 실행 중 오류: {e}")
    
    yield
    # Shutdown
    pass


app = FastAPI(
    title="KOSA Recruit API",
    description="Team project for FastAPI",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 라우터 등록
app.include_router(api_router, prefix="")


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    ) 