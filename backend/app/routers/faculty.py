from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Mentor, Student, Project

router = APIRouter()

# ----------------------------
# Mentor Login
# ----------------------------
@router.post("/login")
def mentor_login(data: dict, db: Session = Depends(get_db)):
    mentor = db.query(Mentor).filter(
        Mentor.email == data["username"],
        Mentor.password == data["password"]
    ).first()

    if not mentor:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "id": mentor.mentor_id,          # 👈 REQUIRED
        "mentor_id": mentor.mentor_id,   # 👈 REQUIRED
        "name": mentor.name,
        "email": mentor.email,
        "department": mentor.department,
        "userType": "mentor"
    }


# ----------------------------
# Get all mentors (Admin)
# ----------------------------
@router.get("/")
def get_all_mentors(db: Session = Depends(get_db)):
    return db.query(Mentor).all()

# ----------------------------
# Mentor Dashboard – Projects
# ----------------------------
@router.get("/projects/{mentor_id}")
def get_mentor_projects(mentor_id: int, db: Session = Depends(get_db)):
    rows = (
        db.query(Project, Student)
        .join(Student, Project.student_id == Student.student_id)
        .filter(Project.mentor_id == mentor_id)
        .all()
    )

    data = []
    for project, student in rows:
        data.append({
            "id": project.id,
            "project_id": project.project_id,
            "title": project.title,
            "student_name": student.name,
            "github_link": project.github_link,
            "status": project.status or "Pending",
            "progress_percentage": project.progress_percentage or 0,
            "mentor_feedback": project.mentor_feedback or "",
            "last_updated": (
                project.last_updated
                if project.last_updated
                else project.submission_date
            )
        })

    return data




# ----------------------------
# Approve / Reject Project
# ----------------------------
@router.put("/projects/{project_id}/status")
def update_project_status(project_id: int, data: dict, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    project.status = data["status"]

    if "mentor_feedback" in data:
        project.mentor_feedback = data["mentor_feedback"]

    if "progress_percentage" in data:
        project.progress_percentage = data["progress_percentage"]

    db.commit()
    db.refresh(project)

    return {"message": "Project updated"}


@router.get("/mentor/{mentor_id}/students")
def get_mentor_students(mentor_id: int, db: Session = Depends(get_db)):
    students = db.query(Student).filter(Student.mentor_id == mentor_id).all()

    return [
        {
            "student_id": s.student_id,
            "name": s.name,
            "email": s.email,
            "prn": s.prn,
            "github_link": s.github_link
        }
        for s in students
    ]

