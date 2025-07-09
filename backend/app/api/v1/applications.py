from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.core.database import get_db
from app.schemas.application import (
    ApplicationCreate, ApplicationUpdate, ApplicationDetail, 
    ApplicationList
)
from app.models.application import Application, ApplyStatus, ApplicationStatus
from app.models.user import User
from app.api.v1.auth import get_current_user
from app.models.resume import Resume, Spec
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
    # joinedload를 사용하여 관계 데이터를 한 번에 가져오기
    application = (
        db.query(Application)
        .options(
            joinedload(Application.user),
            joinedload(Application.resume).joinedload(Resume.specs)
        )
        .filter(Application.id == application_id)
        .first()
    )
    
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Spec 데이터 분류 (의미적으로 유사한 것들을 그룹화)
    educations = []
    awards = []
    certificates = []
    skills = []
    experiences = []  # activities + project_experience를 통합
    
    if application.resume and application.resume.specs:
        for spec in application.resume.specs:
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
        "birthDate": user.birth_date.isoformat() if user and getattr(user, "birth_date", None) else None,
        "email": user.email if user else "",
        "address": user.address if user else "",
        "phone": user.phone if user else "",
        "educations": educations,  # Spec 테이블에서 가져오기
        "awards": awards,      # Spec 테이블에서 가져오기
        "certificates": certificates, # Spec 테이블에서 가져오기
        "skills": skills,      # Spec 테이블에서 가져오기
        "experiences": experiences, # activities + project_experience 통합
        "content": application.resume.content if application.resume else ""
    }
    
    print(f"API 응답 데이터: {response_data}")
    print(f"User 정보: {application.user.name if application.user else 'None'}")
    print(f"Resume 정보: {application.resume.content[:50] if application.resume and application.resume.content is not None else 'None'}")
    print(f"Spec 개수: {len(application.resume.specs) if application.resume else 0}")
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
    db_application = Application(
        **application.dict(),
        user_id=current_user.id
    )
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
        application.status = str(status_update.status)
    if status_update.document_status:
        application.document_status = str(status_update.document_status)
    db.commit()
    return {"message": "Application status updated successfully"}


@router.get("/job/{job_post_id}/applicants")
def get_applicants_by_job(
    job_post_id: int,
    db: Session = Depends(get_db)
):
    # joinedload를 사용하여 관계 데이터를 한 번에 가져오기
    applications = (
        db.query(Application)
        .options(
            joinedload(Application.user),
            joinedload(Application.resume).joinedload(Resume.specs)
        )
        .filter(Application.job_post_id == job_post_id)
        .all()
    )
    
    applicants = []
    for app in applications:
        # ApplicantUser 확인
        is_applicant = db.query(ApplicantUser).filter(ApplicantUser.id == app.user_id).first()
        if not is_applicant:
            continue
            
        if not app.user:
            continue
            
        # 학력 정보 추출: resume.specs에서 추출
        education = None
        degree = None  # 추가: degree 정보
        if app.resume and app.resume.specs:
            edu_specs = [
                s for s in app.resume.specs 
                if s.spec_type == "education" and s.spec_title == "institution"
            ]
            if edu_specs:
                education = edu_specs[0].spec_description  # 최신 학교명만 추출
            # degree 정보 추출
            degree_specs = [
                s for s in app.resume.specs
                if s.spec_type == "education" and s.spec_title == "degree"
            ]
            if degree_specs:
                degree = degree_specs[0].spec_description

        applicant_data = {
            "id": app.user.id,
            "name": app.user.name,
            "email": app.user.email,
            "application_id": app.id,
            "status": app.status,
            "applied_at": app.applied_at,
            "score": app.score,
            "birthDate": user.birth_date.isoformat() if user and getattr(user, "birth_date", None) else None,
            "gender": user.gender if user and getattr(user, "gender", None) else None
        }
        applicants.append(applicant_data)
    return applicants