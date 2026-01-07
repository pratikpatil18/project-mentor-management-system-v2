from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Admin(Base):
    __tablename__ = "admin"
    admin_id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(255), nullable=False)

class Mentor(Base):
    __tablename__ = "mentor"
    mentor_id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    department = Column(String(100))

class Student(Base):
    __tablename__ = "student"
    student_id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    prn = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    mentor_id = Column(Integer, ForeignKey("mentor.mentor_id"))
    github_link = Column(String(255))

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    project_id = Column(String(20), nullable=False)

    title = Column(String(255), nullable=False)
    description = Column(Text)

    student_id = Column(Integer, nullable=False)
    mentor_id = Column(Integer, nullable=True)

    status = Column(String(30), nullable=False, default="Pending")
    progress_percentage = Column(Integer, nullable=False, default=0)

    mentor_feedback = Column(Text)
    github_link = Column(String(255))

    submission_date = Column(DateTime, server_default=func.now())
    last_updated = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now()
    )

class Message(Base):
    __tablename__ = "messages"
    message_id = Column(Integer, primary_key=True)
    project_id = Column(Integer)
    sender_type = Column(String(20))
    sender_id = Column(Integer)
    message_text = Column(Text)
    sent_at = Column(DateTime, server_default=func.now())
