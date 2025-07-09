import enum
from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship
from datetime import datetime
from app.core.database import Base


class InterviewStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class Schedule(Base):
    __tablename__ = "schedule"
    
    id = Column(Integer, primary_key=True, index=True)
    schedule_type = Column(String(255))
    user_id = Column(Integer, ForeignKey('company_user.id'))
    title = Column(String(255))
    description = Column(Text)
    location = Column(String(255))
    scheduled_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(String(255))
    
    # Relationships
    user = relationship("CompanyUser")
    interviews = relationship("ScheduleInterview", back_populates="schedule")


class ScheduleInterview(Base):
    __tablename__ = "schedule_interview"
    
    id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey('schedule.id'))
    user_id = Column(Integer, ForeignKey('company_user.id'))
    schedule_date = Column(DateTime)
    status = Column(SqlEnum(InterviewStatus), default=InterviewStatus.SCHEDULED, nullable=False)
    
    # Relationships
    schedule = relationship("Schedule", back_populates="interviews")
    user = relationship("CompanyUser") 