import enum
from sqlalchemy import Column, Integer, ForeignKey, DECIMAL, Text, TIMESTAMP, Boolean, Enum as SqlEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.job import JobPost
from app.models.application import Application, ApplyStatus

class EvaluationStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUBMITTED = "SUBMITTED"
    CONFIRMED = "CONFIRMED"
    REJECTED = "REJECTED"

class InterviewEvaluation(Base):
    __tablename__ = 'interview_evaluation'
    id = Column(Integer, primary_key=True, autoincrement=True)
    interview_id = Column(Integer, ForeignKey('schedule_interview.id'), nullable=False)
    evaluator_id = Column(Integer, ForeignKey('company_user.id'))
    is_ai = Column(Boolean, default=False)
    score = Column(DECIMAL(5,2))
    summary = Column(Text)
    created_at = Column(TIMESTAMP)
    status = Column(SqlEnum(EvaluationStatus), default=EvaluationStatus.PENDING, nullable=False)

    details = relationship('EvaluationDetail', back_populates='evaluation')

class EvaluationDetail(Base):
    __tablename__ = 'evaluation_detail'
    id = Column(Integer, primary_key=True, autoincrement=True)
    evaluation_id = Column(Integer, ForeignKey('interview_evaluation.id'), nullable=False)
    category = Column(Text)
    grade = Column(Text)
    score = Column(DECIMAL(5,2))

    evaluation = relationship('InterviewEvaluation', back_populates='details')

def auto_process_applications(db: Session):
    now = datetime.now()
    expired_jobposts = db.query(JobPost).filter(JobPost.end_date < now).all()
    for jobpost in expired_jobposts:
        headcount = getattr(jobpost, 'headcount', 1) or 1
        limit = headcount * 3
        # 대기 상태 지원서만 score 기준 내림차순 정렬
        waiting_apps = db.query(Application).filter(
            Application.job_post_id == jobpost.id,
            Application.status == ApplyStatus.WAITING
        ).order_by(Application.score.desc().nullslast()).all()
        # 상위 N명만 PASSED, 나머지는 REJECTED
        for idx, app in enumerate(waiting_apps):
            if idx < limit:
                app.status = str(ApplyStatus.PASSED)
            else:
                app.status = str(ApplyStatus.REJECTED)
    db.commit()
    return True 