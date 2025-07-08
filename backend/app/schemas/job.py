from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class TeamMemberDto(BaseModel):
    email: str
    role: str


class WeightDto(BaseModel):
    item: str
    score: float


class JobPost(BaseModel):
    title: str
    department: Optional[str] = None
    qualifications: Optional[str] = None
    conditions: Optional[str] = None
    job_details: Optional[str] = None
    procedures: Optional[str] = None
    headcount: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    location: Optional[str] = None
    employment_type: Optional[str] = None
    deadline: Optional[str] = None
    status: Optional[str] = "ACTIVE"


class JobPostCreate(JobPost):
    company_id: Optional[int] = None  # 선택적 필드로 변경
    teamMembers: Optional[List[TeamMemberDto]] = None
    weights: Optional[List[WeightDto]] = None


class JobPostUpdate(JobPost):
    teamMembers: Optional[List[TeamMemberDto]] = None
    weights: Optional[List[WeightDto]] = None


class JobPostDetail(JobPost):
    id: int
    company_id: int
    companyName: Optional[str] = None
    department: Optional[str] = None
    teamMembers: Optional[List[TeamMemberDto]] = None
    weights: Optional[List[WeightDto]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class JobPostList(BaseModel):
    id: int
    title: str
    procedures: Optional[str] = None
    headcount: Optional[int] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    companyName: Optional[str] = None
    status: Optional[str] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class JobBase(BaseModel):
    title: str
    company: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class JobCreate(JobBase):
    pass


class JobUpdate(JobBase):
    pass


class JobDetail(JobBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True 