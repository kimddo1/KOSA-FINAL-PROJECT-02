from pydantic import BaseModel
from typing import Optional

class InterviewQuestionBase(BaseModel):
    application_id: int
    type: Optional[str]
    question_text: str

class InterviewQuestionCreate(InterviewQuestionBase):
    pass

class InterviewQuestion(InterviewQuestionBase):
    id: int
    class Config:
        orm_mode = True 