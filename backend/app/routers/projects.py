from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models import Project
import random
from app.models import Project, Student, Mentor
from fastapi import HTTPException

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_project(data: dict, db: Session = Depends(get_db)):
    pid = f"PRJ{random.randint(1000,9999)}"
    project = Project(
        project_id=pid,
        title=data["title"],
        description=data["description"],
        student_id=data["student_id"],
        mentor_id=data["mentor_id"],
        github_link=data.get("github_link"),
        status="Pending",
        progress_percentage=0,
        mentor_feedback=None
    )

    db.add(project)
    db.commit()
    return {"message": "Project created"}

from app.models import Project, Mentor

@router.get("/student/{student_id}")
def student_projects(student_id: int, db: Session = Depends(get_db)):
    projects = (
        db.query(Project, Student, Mentor)
        .join(Student, Project.student_id == Student.student_id)
        .outerjoin(Mentor, Project.mentor_id == Mentor.mentor_id)
        .filter(Project.student_id == student_id)
        .all()
    )

    result = []
    for p, s, m in projects:
        result.append({
            "id": p.id,
            "project_id": p.project_id,
            "title": p.title,
            "description": p.description,
            "student_name": s.name,
            "mentor_name": m.name if m else None,
            "status": p.status,
            "progress_percentage": p.progress_percentage,
            "github_link": p.github_link,
            "mentor_feedback": p.mentor_feedback,
            "last_updated": p.last_updated,
            "submission_date": p.submission_date
        })

    return result


@router.get("/{project_id}")
def get_project(project_id: int, db: Session = Depends(get_db)):
    project = (
        db.query(
            Project.id,
            Project.project_id,
            Project.title,
            Project.description,
            Project.github_link,
            Project.status,
            Project.progress_percentage,
            Project.mentor_feedback,
            Project.last_updated,
            Student.name.label("student_name"),
            Mentor.name.label("mentor_name")
        )
        .join(Student, Student.student_id == Project.student_id)
        .outerjoin(Mentor, Mentor.mentor_id == Project.mentor_id)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return {
        "id": project.id,
        "project_id": project.project_id,
        "title": project.title,
        "description": project.description,
        "github_link": project.github_link,
        "status": project.status,
        "progress_percentage": project.progress_percentage,
        "mentor_feedback": project.mentor_feedback,
        "last_updated": project.last_updated,
        "student_name": project.student_name,
        "mentor_name": project.mentor_name
    }

@router.put("/{project_id}")
def update_project(project_id: int, data: dict, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    for key, value in data.items():
        setattr(project, key, value)
    db.commit()
    return {"message": "Updated"}


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Block deleting approved projects
    if project.status == "Approved":
        raise HTTPException(status_code=403, detail="Approved projects cannot be deleted")

    db.delete(project)
    db.commit()

    return {"message": "Project deleted successfully"}