from sqlalchemy import Column, Integer, ForeignKey, Text
from app.core.database import Base

class InterviewQuestion(Base):
    __tablename__ = 'interview_question'
    id = Column(Integer, primary_key=True, autoincrement=True)
    application_id = Column(Integer, ForeignKey('application.id'), nullable=False)
    type = Column(Text)
    question_text = Column(Text) 