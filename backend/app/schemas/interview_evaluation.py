from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum

class EvaluationDetailBase(BaseModel):
    category: Optional[str]
    grade: Optional[str]
    score: Optional[float]

class EvaluationDetailCreate(EvaluationDetailBase):
    pass

class EvaluationDetail(EvaluationDetailBase):
    id: int
    evaluation_id: int
    class Config:
        orm_mode = True

class EvaluationStatus(str, Enum):
    PENDING = "PENDING"
    SUBMITTED = "SUBMITTED"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"

class InterviewEvaluationBase(BaseModel):
    interview_id: int
    evaluator_id: Optional[int]
    is_ai: Optional[bool] = False
    score: Optional[float]
    summary: Optional[str]
    status: Optional[EvaluationStatus] = EvaluationStatus.PENDING

class InterviewEvaluationCreate(InterviewEvaluationBase):
    details: Optional[List[EvaluationDetailCreate]] = []

class InterviewEvaluation(InterviewEvaluationBase):
    id: int
    created_at: Optional[datetime]
    details: List[EvaluationDetail] = []
    class Config:
        orm_mode = True 