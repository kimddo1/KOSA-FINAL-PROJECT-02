from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
import enum
from sqlalchemy import Enum as SqlEnum


class ApplyStatus(str, enum.Enum):
    WAITING = "WAITING"
    PASSED = "PASSED"
    REJECTED = "REJECTED"


class ApplicationViewAction(str, enum.Enum):
    VIEW = "VIEW"
    DOWNLOAD = "DOWNLOAD"


class ApplicationStatus(str, enum.Enum):
    DOCUMENT_WAITING = "DOCUMENT_WAITING"
    DOCUMENT_PASSED = "DOCUMENT_PASSED"
    DOCUMENT_REJECTED = "DOCUMENT_REJECTED"


class Application(Base):
    __tablename__ = "application"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    resume_id = Column(Integer, ForeignKey('resume.id'))
    job_post_id = Column(Integer, ForeignKey('jobpost.id'), nullable=False)
    score = Column(Numeric(10, 2))
    ai_score = Column(Numeric(5, 2))
    human_score = Column(Numeric(5, 2))
    final_score = Column(Numeric(5, 2))
    status = Column(SqlEnum(ApplyStatus), default=ApplyStatus.WAITING, nullable=False)
    document_status = Column(SqlEnum(ApplicationStatus), default=ApplicationStatus.DOCUMENT_WAITING, nullable=False)
    applied_at = Column(DateTime, default=datetime.utcnow)
    application_source = Column(String(255))
    pass_reason = Column(Text)
    fail_reason = Column(Text)
    
    # Relationships
    user = relationship("User")
    job_post = relationship("JobPost", back_populates="applications")
    resume = relationship("Resume")
    field_scores = relationship("FieldNameScore", back_populates="application")
    memos = relationship("ResumeMemo", back_populates="application")


class FieldNameScore(Base):
    __tablename__ = "field_name_score"
    
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey('application.id'), nullable=False)
    field_name = Column(String(255), nullable=False)
    score = Column(Numeric(10, 2))
    
    # Relationships
    application = relationship("Application", back_populates="field_scores") 