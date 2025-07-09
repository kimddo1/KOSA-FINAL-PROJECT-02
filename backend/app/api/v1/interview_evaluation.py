from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.models.interview_evaluation import InterviewEvaluation, EvaluationDetail
from app.schemas.interview_evaluation import InterviewEvaluation, InterviewEvaluationCreate

router = APIRouter()

@router.post("/", response_model=InterviewEvaluation)
def create_evaluation(evaluation: InterviewEvaluationCreate, db: Session = Depends(get_db)):
    db_evaluation = InterviewEvaluation(
        interview_id=evaluation.interview_id,
        evaluator_id=evaluation.evaluator_id,
        is_ai=evaluation.is_ai,
        score=evaluation.score,
        summary=evaluation.summary
    )
    db.add(db_evaluation)
    db.commit()
    db.refresh(db_evaluation)
    # 상세 평가 등록
    for detail in evaluation.details or []:
        db_detail = EvaluationDetail(
            evaluation_id=db_evaluation.id,
            category=detail.category,
            grade=detail.grade,
            score=detail.score
        )
        db.add(db_detail)
    db.commit()
    db.refresh(db_evaluation)
    return db_evaluation

@router.get("/interview/{interview_id}", response_model=List[InterviewEvaluation])
def get_evaluations_by_interview(interview_id: int, db: Session = Depends(get_db)):
    return db.query(InterviewEvaluation).filter(InterviewEvaluation.interview_id == interview_id).all() 