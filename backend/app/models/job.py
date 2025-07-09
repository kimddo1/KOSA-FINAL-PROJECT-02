from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


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
    schedules = Column(Text)
    weights = Column(Text)
    status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    company = relationship("Company", back_populates="job_posts")
    department_rel = relationship("Department")
    user = relationship("User")
    applications = relationship("Application", back_populates="job_post")


class Job(Base):
    __tablename__ = "job"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    company = Column(String(100))
    description = Column(Text)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    user_id = Column(Integer, ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User") 