from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Student

router = APIRouter()

# -----------------------------
# STUDENT LOGIN
# -----------------------------
@router.post("/login")
def student_login(data: dict, db: Session = Depends(get_db)):
    student = db.query(Student).filter(
        Student.email == data["username"],
        Student.password == data["password"]
    ).first()

    if not student:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {
        "student_id": student.student_id,
        "name": student.name,
        "email": student.email,
        "prn": student.prn,
        "mentor_id": student.mentor_id,
        "github_link": student.github_link
    }

# -----------------------------
# GET ALL STUDENTS (Admin)
# -----------------------------
@router.get("/student")
def get_students(db: Session = Depends(get_db)):
    return db.query(Student).all()

# -----------------------------
# STUDENT UPDATES ONLY GITHUB
# -----------------------------
@router.put("/{student_id}/github")
def update_github(student_id: int, data: dict, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.github_link = data["github_link"]
    db.commit()
    return {"message": "GitHub updated"}
