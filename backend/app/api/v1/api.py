from fastapi import APIRouter
from app.api.v1 import auth, company_jobs, public_jobs, applications, resumes, companies, notifications, schedules, users
from app.api.v1 import interview_evaluation, interview_question

api_router = APIRouter(prefix="/api/v1")

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(company_jobs.router, prefix="/company/jobposts", tags=["company-jobs"])
api_router.include_router(public_jobs.router, prefix="/public/jobposts", tags=["public-jobs"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
api_router.include_router(companies.router, prefix="/companies", tags=["companies"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(schedules.router, prefix="/schedules", tags=["schedules"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(interview_evaluation.router, prefix="/interview-evaluations", tags=["interview-evaluations"])
api_router.include_router(interview_question.router, prefix="/interview-questions", tags=["interview-questions"])