from sqlalchemy.orm import Session
from app.models.job import JobPost
from app.schemas.job import JobPostCreate, JobPostUpdate
from fastapi import HTTPException
from typing import List


class JobService:
    @staticmethod
    def get_job_posts(db: Session, skip: int = 0, limit: int = 100) -> List[JobPost]:
        """채용공고 목록 조회"""
        job_posts = db.query(JobPost).offset(skip).limit(limit).all()
        
        # Add company name to each job post
        for job_post in job_posts:
            if job_post.company:
                job_post.companyName = job_post.company.name
        
        return job_posts
    
    @staticmethod
    def get_job_post(db: Session, job_post_id: int) -> JobPost:
        """채용공고 상세 조회"""
        job_post = db.query(JobPost).filter(JobPost.id == job_post_id).first()
        if not job_post:
            raise HTTPException(status_code=404, detail="Job post not found")
        
        # Add company name to the response
        if job_post.company:
            job_post.companyName = job_post.company.name
        
        return job_post
    
    @staticmethod
    def create_job_post(db: Session, job_post: JobPostCreate) -> JobPost:
        """채용공고 생성"""
        db_job_post = JobPost(**job_post.dict())
        db.add(db_job_post)
        db.commit()
        db.refresh(db_job_post)
        
        # Add company name to the response
        if db_job_post.company:
            db_job_post.companyName = db_job_post.company.name
        
        return db_job_post
    
    @staticmethod
    def update_job_post(db: Session, job_post_id: int, job_post: JobPostUpdate) -> JobPost:
        """채용공고 수정"""
        db_job_post = db.query(JobPost).filter(JobPost.id == job_post_id).first()
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
    
    @staticmethod
    def delete_job_post(db: Session, job_post_id: int):
        """채용공고 삭제"""
        db_job_post = db.query(JobPost).filter(JobPost.id == job_post_id).first()
        if not db_job_post:
            raise HTTPException(status_code=404, detail="Job post not found")
        
        db.delete(db_job_post)
        db.commit()
        return {"message": "Job post deleted successfully"} 