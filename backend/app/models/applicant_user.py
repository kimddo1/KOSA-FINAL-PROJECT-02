from sqlalchemy import Column, Integer, String
from app.core.database import Base

class ApplicantUser(Base):
    __tablename__ = "applicant_user"
    id = Column(Integer, primary_key=True, index=True)
    resume_file_path = Column(String(255)) 