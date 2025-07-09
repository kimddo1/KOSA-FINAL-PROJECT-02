from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.schemas.application import (
    ApplicationCreate, ApplicationUpdate, ApplicationDetail, 
    ApplicationList, ApplicantList, ApplicationStatusHistoryCreate
)
from app.models.application import Application, ApplyStatus
from app.models.user import User
from app.api.v1.auth import get_current_user
from app.models.resume import Resume
from app.models.user import User
from app.models.applicant_user import ApplicantUser

router = APIRouter()


@router.get("/", response_model=List[ApplicationList])
def get_applications(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    applications = db.query(Application).offset(skip).limit(limit).all()
    return applications


@router.get("/{application_id}", response_model=ApplicationDetail)
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # 이력서 정보도 함께 가져오기
    from app.models.resume import Resume, Spec
    
    resume = None
    user = None
    specs = []
    
    if application.resume_id is not None:
        resume = db.query(Resume).filter(Resume.id == application.resume_id).first()
        if resume:
            specs = db.query(Spec).filter(Spec.resume_id == application.resume_id).all()
    
    if application.user_id is not None:
        user = db.query(User).filter(User.id == application.user_id).first()
    
    # Spec 데이터 분류 (의미적으로 유사한 것들을 그룹화)
    educations = []
    awards = []
    certificates = []
    skills = []
    experiences = []  # activities + project_experience를 통합
    
    for spec in specs:
        spec_type = str(spec.spec_type)
        spec_title = str(spec.spec_title)
        spec_description = spec.spec_description or ""
        
        if spec_type == "education":
            if spec_title == "institution":
                # 새로운 교육 항목 시작
                education = {
                    "period": "",
                    "schoolName": spec_description,
                    "major": "",
                    "graduated": False,
                    "degree": "",
                    "gpa": "",
                    "duration": ""
                }
                educations.append(education)
            elif spec_title == "start_date":
                if educations:
                    educations[-1]["startDate"] = spec_description
            elif spec_title == "end_date":
                if educations:
                    educations[-1]["endDate"] = spec_description
            elif spec_title == "degree":
                if educations:
                    educations[-1]["degree"] = spec_description
            elif spec_title == "gpa":
                if educations:
                    educations[-1]["gpa"] = spec_description
            elif spec_title == "duration":
                if educations:
                    educations[-1]["duration"] = spec_description
        
        elif spec_type == "awards":
            if spec_title == "title":
                award = {
                    "title": spec_description,
                    "date": "",
                    "description": "",
                    "duration": ""
                }
                awards.append(award)
            elif spec_title == "date":
                if awards:
                    awards[-1]["date"] = spec_description
            elif spec_title == "description":
                if awards:
                    awards[-1]["description"] = spec_description
            elif spec_title == "duration":
                if awards:
                    awards[-1]["duration"] = spec_description
        
        elif spec_type == "certifications":
            if spec_title == "name":
                certificate = {
                    "name": spec_description,
                    "date": "",
                    "duration": ""
                }
                certificates.append(certificate)
            elif spec_title == "date":
                if certificates:
                    certificates[-1]["date"] = spec_description
            elif spec_title == "duration":
                if certificates:
                    certificates[-1]["duration"] = spec_description
        
        elif spec_type == "skills":
            skills.append(spec_description)
        
        elif spec_type == "activities":
            if spec_title == "organization":
                experience = {
                    "type": "activity",
                    "organization": spec_description,
                    "role": "",
                    "period": "",
                    "description": "",
                    "duration": ""
                }
                experiences.append(experience)
            elif spec_title == "role":
                if experiences and experiences[-1]["type"] == "activity":
                    experiences[-1]["role"] = spec_description
            elif spec_title == "period":
                if experiences and experiences[-1]["type"] == "activity":
                    experiences[-1]["period"] = spec_description
            elif spec_title == "description":
                if experiences and experiences[-1]["type"] == "activity":
                    experiences[-1]["description"] = spec_description
            elif spec_title == "duration":
                if experiences and experiences[-1]["type"] == "activity":
                    experiences[-1]["duration"] = spec_description
        
        elif spec_type == "project_experience":
            if spec_title == "title":
                experience = {
                    "type": "project",
                    "title": spec_description,
                    "role": "",
                    "duration": "",
                    "technologies": "",
                    "description": ""
                }
                experiences.append(experience)
            elif spec_title == "role":
                if experiences and experiences[-1]["type"] == "project":
                    experiences[-1]["role"] = spec_description
            elif spec_title == "duration":
                if experiences and experiences[-1]["type"] == "project":
                    experiences[-1]["duration"] = spec_description
            elif spec_title == "technologies":
                if experiences and experiences[-1]["type"] == "project":
                    experiences[-1]["technologies"] = spec_description
            elif spec_title == "description":
                if experiences and experiences[-1]["type"] == "project":
                    experiences[-1]["description"] = spec_description
    
    # 응답 데이터 구성
    response_data = {
        "id": application.id,
        "user_id": application.user_id,
        "resume_id": application.resume_id,
        "job_post_id": application.job_post_id,
        "score": application.score,
        "ai_score": application.ai_score,
        "human_score": application.human_score,
        "final_score": application.final_score,
        "status": application.status,
        "applied_at": application.applied_at,
        "application_source": application.application_source,
        "pass_reason": application.pass_reason,
        "fail_reason": application.fail_reason,
        "created_at": None,
        "updated_at": None,
        # 이력서 정보 추가
        "applicantName": user.name if user else "",
        "gender": user.gender if user else "",
<<<<<<< HEAD
        "birthDate": str(user.birth_date) if user.birth_date else None,
=======
        "birthDate": user.birth_date if user else "",
>>>>>>> origin/main
        "email": user.email if user else "",
        "address": user.address if user else "",
        "phone": user.phone if user else "",
        "educations": educations,  # Spec 테이블에서 가져오기
        "awards": awards,      # Spec 테이블에서 가져오기
        "certificates": certificates, # Spec 테이블에서 가져오기
        "skills": skills,      # Spec 테이블에서 가져오기
        "experiences": experiences, # activities + project_experience 통합
        "content": resume.content if resume else ""
    }
    
    print(f"API 응답 데이터: {response_data}")
    print(f"User 정보: {user.name if user else 'None'}")
    print(f"Resume 정보: {resume.content[:50] if resume and resume.content is not None else 'None'}")
    print(f"Spec 개수: {len(specs)}")
    print(f"Education 개수: {len(educations)}")
    print(f"Awards 개수: {len(awards)}")
    print(f"Certificates 개수: {len(certificates)}")
    
    return response_data


@router.post("/", response_model=ApplicationDetail)
def create_application(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_application = Application(**application.dict(), user_id=current_user.id)
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application


@router.put("/{application_id}/status")
def update_application_status(
    application_id: int,
    status_update: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if status_update.status:
        # 상태 변경 히스토리 기록 (ApplicationStatusHistory 모델이 없으므로 주석처리)
        # status_history = ApplicationStatusHistory(
        #     application_id=application_id,
        #     status=str(status_update.status),
        #     comment=status_update.cover_letter
        # )
        # db.add(status_history)
        
        # 애플리케이션 상태 업데이트
        application.status = str(status_update.status)  # type: ignore
    
    db.commit()
    return {"message": "Application status updated successfully"}


@router.get("/job/{job_post_id}/applicants")
def get_applicants_by_job(
    job_post_id: int,
    db: Session = Depends(get_db)
):
    applications = db.query(Application).filter(Application.job_post_id == job_post_id).all()
    applicants = []
    for app in applications:
        is_applicant = db.query(ApplicantUser).filter(ApplicantUser.id == app.user_id).first()
        if not is_applicant:
            continue
        user = db.query(User).filter(User.id == app.user_id).first()
        if not user:
            continue
        applicant_data = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "application_id": app.id,
            "status": app.status,
            "applied_at": app.applied_at,
            "score": app.score,
            "birthDate": user.birth_date.isoformat() if user.birth_date else None,
            "gender": user.gender if user.gender else None
        }
        applicants.append(applicant_data)
    return applicants