from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base
from .written_test_question import WrittenTestQuestion


class JobPost(Base):
    __tablename__ = "jobpost"
    
    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey('company.id'))
    department_id = Column(Integer, ForeignKey('department.id'))
    user_id = Column(Integer, ForeignKey('users.id'))
    title = Column(String(200), nullable=False)
    department = Column(String(100))
    qualifications = Column(Text)
    conditions = Column(Text)
    job_details = Column(Text)
    procedures = Column(Text)
    headcount = Column(Integer)
    start_date = Column(String(50))
    end_date = Column(String(50))
    location = Column(String(255))
    employment_type = Column(String(50))
    deadline = Column(String(50))
    team_members = Column(Text)
    weights = Column(Text)
    status = Column(String(20), default="SCHEDULED")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships with back_populates
    company = relationship("Company", back_populates="job_posts")
    department = relationship("Department", back_populates="job_posts")
    user = relationship("User", back_populates="job_posts")
    applications = relationship("Application", back_populates="job_post")
    interview_schedules = relationship("Schedule", back_populates="job_post", cascade="all, delete-orphan")
    jobpost_roles = relationship("JobPostRole", back_populates="jobpost", cascade="all, delete-orphan")
    written_test_questions = relationship("WrittenTestQuestion", back_populates="job_post")


class JobPostRole(Base):
    __tablename__ = "jobpost_role"
    
    jobpost_id = Column(Integer, ForeignKey('jobpost.id'), primary_key=True)
    company_user_id = Column(Integer, ForeignKey('company_user.id'), primary_key=True)
    role = Column(String(30), nullable=False)  # MANAGER, MEMBER
    granted_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    jobpost = relationship("JobPost", back_populates="jobpost_roles")
    company_user = relationship("CompanyUser", back_populates="jobpost_roles") 