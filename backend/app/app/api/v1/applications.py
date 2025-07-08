from fastapi import APIRouter, Query
from fastapi.responses import JSONResponse

router = APIRouter()

@router.get("/passed-applicants")
def get_passed_applicants(jobPostId: int = Query(...)):
    # 샘플 데이터
    data = [
        {"id": 1, "name": "홍길동", "interviewDate": "2025-07-10 14:00"},
        {"id": 2, "name": "김철수", "interviewDate": "2025-07-10 15:00"},
        {"id": 3, "name": "이영희", "interviewDate": "2025-07-11 10:00"},
        {"id": 4, "name": "박영수", "interviewDate": "2025-07-11 10:00"},
    ]
    # 실제로는 jobPostId로 필터링
    return JSONResponse(content=data) 