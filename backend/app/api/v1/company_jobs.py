from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from app.core.database import get_db
from app.schemas.job import JobPostCreate, JobPostUpdate, JobPostDetail, JobPostList, PostInterviewCreate, PostInterviewDetail
from app.models.job import JobPost, PostInterview
from app.models.weight import Weight
from app.models.user import User
from app.api.v1.auth import get_current_user

router = APIRouter()

# 기업 공고 API 접근 가능 권한: ADMIN, MEMBER, MANAGER, EMPLOYEE (USER는 불가)
ALLOWED_COMPANY_ROLES = ["ADMIN", "MEMBER", "MANAGER", "EMPLOYEE"]

def check_company_role(current_user: User):
    """기업 회원 권한 체크"""
    if current_user.role not in ALLOWED_COMPANY_ROLES:
        raise HTTPException(status_code=403, detail="기업 회원만 접근 가능합니다")

@router.get("/", response_model=List[JobPostList])
def get_company_job_posts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 기업 사용자만 접근 가능
    check_company_role(current_user)
    
    job_posts = db.query(JobPost).filter(JobPost.company_id == current_user.company_id).offset(skip).limit(limit).all()
    
    # Add company name to each job post
    for job_post in job_posts:
        if job_post.company:
            job_post.companyName = job_post.company.name
    
    return job_posts


@router.get("/{job_post_id}", response_model=JobPostDetail)
def get_company_job_post(
    job_post_id: int, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 기업 사용자만 접근 가능
    check_company_role(current_user)
    
    job_post = db.query(JobPost).filter(
        JobPost.id == job_post_id,
        JobPost.company_id == current_user.company_id
    ).first()
    
    if not job_post:
        raise HTTPException(status_code=404, detail="Job post not found")
    
    # Add company name to the response
    if job_post.company:
        job_post.companyName = job_post.company.name
    
    # JSON 데이터를 파싱하여 응답에 추가
    if job_post.team_members:
        job_post.teamMembers = json.loads(job_post.team_members)
    else:
        job_post.teamMembers = []
        
    if job_post.weights:
        job_post.weights = json.loads(job_post.weights)
    else:
        job_post.weights = []
    
    # 면접 일정 조회
    interview_schedules = db.query(PostInterview).filter(PostInterview.job_post_id == job_post.id).all()
    job_post.interview_schedules = interview_schedules
    
    return job_post


@router.post("/", response_model=JobPostDetail, status_code=201)
def create_company_job_post(
    job_post: JobPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 기업 사용자만 접근 가능
    check_company_role(current_user)
    
    job_data = job_post.dict()
    
    # company_id 제거 (백엔드에서 설정)
    job_data.pop('company_id', None)
    
    # 면접 일정 처리
    interview_schedules = job_data.pop('interview_schedules', [])
    
    # 디버깅용 로그
    print(f"Current user: {current_user.id}, company_id: {current_user.company_id}")
    print(f"Job data: {job_data}")
    print(f"Interview schedules: {interview_schedules}")
    
    # JSON 데이터 처리 및 필드명 매핑
    if job_data.get('teamMembers'):
        job_data['team_members'] = json.dumps(job_data['teamMembers']) if job_data['teamMembers'] else None
    else:
        job_data['team_members'] = None
    
    # weights 데이터를 별도로 저장
    weights_data = job_data.pop('weights', [])
    
    # JobPost 모델에 전달할 데이터에서 camelCase 필드 제거
    job_data.pop('teamMembers', None)
    
    db_job_post = JobPost(**job_data, company_id=current_user.company_id)
    db.add(db_job_post)
    db.commit()
    db.refresh(db_job_post)
    
    # 면접 일정 저장
    if interview_schedules:
        for schedule_data in interview_schedules:
            # dict 형태로 전달된 경우 처리
            if isinstance(schedule_data, dict):
                interview_schedule = PostInterview(
                    job_post_id=db_job_post.id,
                    interview_date=schedule_data.get('interview_date'),
                    interview_time=schedule_data.get('interview_time'),
                    location=schedule_data.get('location'),
                    interview_type=schedule_data.get('interview_type', 'ONSITE'),
                    max_participants=schedule_data.get('max_participants', 1),
                    notes=schedule_data.get('notes')
                )
            else:
                # Pydantic 모델로 전달된 경우 처리
                interview_schedule = PostInterview(
                    job_post_id=db_job_post.id,
                    interview_date=schedule_data.interview_date,
                    interview_time=schedule_data.interview_time,
                    location=schedule_data.location,
                    interview_type=schedule_data.interview_type,
                    max_participants=schedule_data.max_participants,
                    notes=schedule_data.notes
                )
            db.add(interview_schedule)
        db.commit()
    
    # 가중치 데이터를 weight 테이블에 저장
    if weights_data:
        for weight_item in weights_data:
            if weight_item.get('item') and weight_item.get('score') is not None:
                weight_record = Weight(
                    target_type='resume_feature',
                    jobpost_id=db_job_post.id,
                    field_name=weight_item['item'],
                    weight_value=float(weight_item['score'])
                )
                db.add(weight_record)
        db.commit()
    
    # Add company name to the response
    if db_job_post.company:
        db_job_post.companyName = db_job_post.company.name
    
    return db_job_post


@router.put("/{job_post_id}", response_model=JobPostDetail)
def update_company_job_post(
    job_post_id: int,
    job_post: JobPostUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 기업 사용자만 접근 가능
    check_company_role(current_user)
    
    db_job_post = db.query(JobPost).filter(
        JobPost.id == job_post_id,
        JobPost.company_id == current_user.company_id
    ).first()
    
    if not db_job_post:
        raise HTTPException(status_code=404, detail="Job post not found")
    
    job_data = job_post.dict(exclude_unset=True)
    
    # 면접 일정 처리
    interview_schedules = job_data.pop('interview_schedules', None)
    
    # JSON 데이터 처리 및 필드명 매핑
    if job_data.get('teamMembers'):
        job_data['team_members'] = json.dumps(job_data['teamMembers']) if job_data['teamMembers'] else None
    else:
        job_data['team_members'] = None
    
    if job_data.get('weights'):
        job_data['weights'] = json.dumps(job_data['weights']) if job_data['weights'] else None
    else:
        job_data['weights'] = None
    
    # JobPost 모델에 전달할 데이터에서 camelCase 필드 제거
    job_data.pop('teamMembers', None)
    job_data.pop('weights', None)
    
    for field, value in job_data.items():
        setattr(db_job_post, field, value)
    
    db.commit()
    db.refresh(db_job_post)
    
    # 면접 일정 업데이트 (기존 일정 삭제 후 새로 생성)
    if interview_schedules is not None:
        # 기존 면접 일정 삭제
        db.query(PostInterview).filter(PostInterview.job_post_id == job_post_id).delete()
        
        # 새로운 면접 일정 추가
        if interview_schedules:
            for schedule_data in interview_schedules:
                # dict 형태로 전달된 경우 처리
                if isinstance(schedule_data, dict):
                    interview_schedule = PostInterview(
                        job_post_id=job_post_id,
                        interview_date=schedule_data.get('interview_date'),
                        interview_time=schedule_data.get('interview_time'),
                        location=schedule_data.get('location'),
                        interview_type=schedule_data.get('interview_type', 'ONSITE'),
                        max_participants=schedule_data.get('max_participants', 1),
                        notes=schedule_data.get('notes')
                    )
                else:
                    # Pydantic 모델로 전달된 경우 처리
                    interview_schedule = PostInterview(
                        job_post_id=job_post_id,
                        interview_date=schedule_data.interview_date,
                        interview_time=schedule_data.interview_time,
                        location=schedule_data.location,
                        interview_type=schedule_data.interview_type,
                        max_participants=schedule_data.max_participants,
                        notes=schedule_data.notes
                    )
                db.add(interview_schedule)
        db.commit()
    
    # Add company name to the response
    if db_job_post.company:
        db_job_post.companyName = db_job_post.company.name
    
    return db_job_post


@router.delete("/{job_post_id}")
def delete_company_job_post(
    job_post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_company_role(current_user)
    
    db_job_post = db.query(JobPost).filter(
        JobPost.id == job_post_id,
        JobPost.company_id == current_user.company_id
    ).first()
    
    if not db_job_post:
        raise HTTPException(status_code=404, detail="Job post not found")
    
    db.delete(db_job_post)
    db.commit()
    return {"message": "Job post deleted successfully"}