# app/models/verification.py

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base
from datetime import datetime

class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    token = Column(String(255), primary_key=True, index=True)
    email = Column(String(255), nullable=False)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
