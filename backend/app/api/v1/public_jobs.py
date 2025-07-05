from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.job import JobPostDetail, JobPostList
from app.models.job import JobPost

router = APIRouter()


@router.get("/", response_model=List[JobPostList])
def get_public_job_posts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """지원자가 볼 수 있는 공개 채용공고 목록"""
    job_posts = db.query(JobPost).filter(JobPost.status == "ACTIVE").offset(skip).limit(limit).all()
    
    # Add company name to each job post
    for job_post in job_posts:
        if job_post.company:
            job_post.companyName = job_post.company.name
    
    return job_posts


@router.get("/{job_post_id}", response_model=JobPostDetail)
def get_public_job_post(
    job_post_id: int, 
    db: Session = Depends(get_db)
):
    """지원자가 볼 수 있는 공개 채용공고 상세"""
    job_post = db.query(JobPost).filter(
        JobPost.id == job_post_id,
        JobPost.status == "ACTIVE"
    ).first()
    
    if not job_post:
        raise HTTPException(status_code=404, detail="Job post not found")
    
    # Add company name to the response
    if job_post.company:
        job_post.companyName = job_post.company.name
    
    return job_post 