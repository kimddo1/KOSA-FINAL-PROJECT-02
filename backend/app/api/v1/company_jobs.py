from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from app.core.database import get_db
from app.schemas.job import JobPostCreate, JobPostUpdate, JobPostDetail, JobPostList
from app.models.job import JobPost
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
    
    # 디버깅용 로그
    print(f"Current user: {current_user.id}, company_id: {current_user.company_id}")
    print(f"Job data: {job_data}")
    
    # JSON 데이터 처리
    if job_data.get('teamMembers'):
        job_data['teamMembers'] = json.dumps(job_data['teamMembers']) if job_data['teamMembers'] else None
    else:
        job_data['teamMembers'] = None
        
    if job_data.get('weights'):
        job_data['weights'] = json.dumps(job_data['weights']) if job_data['weights'] else None
    else:
        job_data['weights'] = None
    
    db_job_post = JobPost(**job_data, company_id=current_user.company_id)
    db.add(db_job_post)
    db.commit()
    db.refresh(db_job_post)
    
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
    
    for field, value in job_post.dict(exclude_unset=True).items():
        setattr(db_job_post, field, value)
    
    db.commit()
    db.refresh(db_job_post)
    
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