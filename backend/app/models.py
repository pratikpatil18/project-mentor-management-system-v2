from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base

class Admin(Base):
    __tablename__ = "admin"
    admin_id = Column(Integer, primary_key=True)
    username = Column(String)
    password = Column(String)

class Mentor(Base):
    __tablename__ = "mentor"
    mentor_id = Column(Integer, primary_key=True)
    name = Column(String)
    email = Column(String)
    password = Column(String)
    department = Column(String)

class Student(Base):
    __tablename__ = "student"
    student_id = Column(Integer, primary_key=True)
    name = Column(String)
    prn = Column(String)
    email = Column(String)
    password = Column(String)
    mentor_id = Column(Integer, ForeignKey("mentor.mentor_id"))
    github_link = Column(String)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True)
    project_id = Column(String, nullable=False)

    title = Column(String, nullable=False)
    description = Column(Text)

    student_id = Column(Integer, nullable=False)
    mentor_id = Column(Integer, nullable=True)

    status = Column(String, nullable=False, default="Pending")
    progress_percentage = Column(Integer, nullable=False, default=0)

    mentor_feedback = Column(Text, default="")
    github_link = Column(String)

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
    sender_type = Column(String)
    sender_id = Column(Integer)
    message_text = Column(Text)
    sent_at = Column(DateTime, server_default=func.now())
