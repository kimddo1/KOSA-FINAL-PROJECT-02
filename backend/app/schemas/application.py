from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.application import Application, ApplyStatus, ApplicationViewAction

def to_camel(string: str) -> str:
    parts = string.split('_')
    return parts[0] + ''.join(word.capitalize() for word in parts[1:])

class ApplicationBase(BaseModel):
    job_post_id: int
    resume_id: int
    status: ApplyStatus = ApplyStatus.WAITING
    score: Optional[float] = None
    ai_score: Optional[float] = None
    human_score: Optional[float] = None
    final_score: Optional[float] = None
    application_source: Optional[str] = None
    pass_reason: Optional[str] = None
    fail_reason: Optional[str] = None
    applied_at: Optional[datetime] = None
    class Config:
        alias_generator = to_camel
        populate_by_name = True


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    status: Optional[ApplyStatus] = None
    class Config:
        alias_generator = to_camel
        populate_by_name = True


class ApplicationDetail(ApplicationBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    # 이력서 정보 필드 추가
    applicantName: Optional[str] = None
    gender: Optional[str] = None
    birthDate: Optional[datetime] = None
    email: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    educations: Optional[List] = None
    awards: Optional[List] = None
    certificates: Optional[List] = None
    skills: Optional[List[str]] = None
    experiences: Optional[List] = None  # activities + project_experience 통합
    content: Optional[str] = None
    
    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True


class ApplicationList(BaseModel):
    id: int
    job_post_id: int
    user_id: int
    status: ApplyStatus
    created_at: datetime
    score: Optional[float] = None
    ai_score: Optional[float] = None
    human_score: Optional[float] = None
    final_score: Optional[float] = None
    application_source: Optional[str] = None
    pass_reason: Optional[str] = None
    fail_reason: Optional[str] = None
    applied_at: Optional[datetime] = None
    
    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True


class ApplicantList(BaseModel):
    id: int
    name: str
    email: str
    application_id: int
    status: ApplyStatus
    applied_at: datetime
    score: Optional[float] = None
    birthDate: Optional[str] = None
    gender: Optional[str] = None
    
    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True


class ApplicationStatusHistoryBase(BaseModel):
    status: ApplyStatus
    comment: Optional[str] = None
    class Config:
        alias_generator = to_camel
        populate_by_name = True


class ApplicationStatusHistoryCreate(ApplicationStatusHistoryBase):
    application_id: int
    class Config:
        alias_generator = to_camel
        populate_by_name = True


class ApplicationStatusHistoryDetail(ApplicationStatusHistoryBase):
    id: int
    application_id: int
    created_at: datetime
    
    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True


class ApplicationViewLogBase(BaseModel):
    application_id: int
    action: ApplicationViewAction
    class Config:
        alias_generator = to_camel
        populate_by_name = True


class ApplicationViewLogCreate(ApplicationViewLogBase):
    pass


class ApplicationViewLogDetail(ApplicationViewLogBase):
    id: int
    viewer_id: int
    created_at: datetime
    
    class Config:
        alias_generator = to_camel
        populate_by_name = True
        from_attributes = True 