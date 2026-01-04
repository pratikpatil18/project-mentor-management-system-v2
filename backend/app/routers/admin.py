from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Student, Mentor, Project, Admin

router = APIRouter()

# -------------------------------
# ADMIN LOGIN
# -------------------------------
@router.post("/login")
def admin_login(data: dict, db: Session = Depends(get_db)):
    admin = db.query(Admin).filter(
        Admin.username == data["username"],
        Admin.password == data["password"]
    ).first()

    if not admin:
        raise HTTPException(401, "Invalid credentials")

    return {
        "admin_id": admin.admin_id,
        "username": admin.username
    }

# -------------------------------
# STUDENTS
# -------------------------------
@router.get("/students")
def get_students(db: Session = Depends(get_db)):
    results = (
        db.query(Student, Mentor)
        .outerjoin(Mentor, Student.mentor_id == Mentor.mentor_id)
        .all()
    )

    data = []
    for student, mentor in results:
        data.append({
            "student_id": student.student_id,
            "name": student.name,
            "prn": student.prn,
            "email": student.email,
            "mentor_id": student.mentor_id,
            "mentor_name": mentor.name if mentor else None,
            "github_link": student.github_link
        })

    return data


@router.post("/students")
def add_student(data: dict, db: Session = Depends(get_db)):
    student = Student(
        name=data["name"],
        prn=data["prn"],
        email=data["email"],
        password=data["password"],
        mentor_id=data.get("mentor_id"),
        github_link=data.get("github_link")
    )

    db.add(student)
    db.commit()
    db.refresh(student)

    return student


@router.delete("/students/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db)):

    # Block if student has approved projects
    approved = db.query(Project).filter(
        Project.student_id == student_id,
        Project.status == "Approved"
    ).count()

    if approved > 0:
        raise HTTPException(
            status_code=403,
            detail="Student has approved projects and cannot be deleted"
        )

    # Delete non-approved projects
    db.query(Project).filter(
        Project.student_id == student_id,
        Project.status != "Approved"
    ).delete(synchronize_session=False)

    # Remove mentor link
    db.query(Student).filter(
        Student.student_id == student_id
    ).update({"mentor_id": None})

    student = db.query(Student).filter(
        Student.student_id == student_id
    ).first()

    if not student:
        raise HTTPException(404, "Student not found")

    db.delete(student)
    db.commit()

    return {"message": "Student and related projects deleted"}


@router.put("/assign-mentor")
def assign_mentor(data: dict, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == data["student_id"]).first()
    if not student:
        raise HTTPException(404, "Student not found")

    student.mentor_id = data["mentor_id"]
    db.commit()
    return {"message": "Mentor assigned"}

@router.put("/reset-student-password/{student_id}")
def reset_student_password(student_id: int, data: dict, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(404, "Student not found")

    student.password = data["password"]
    db.commit()
    return {"message": "Password updated"}


@router.put("/students/{student_id}")
def admin_update_student(student_id: int, data: dict, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()

    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    student.name = data.get("name", student.name)
    student.prn = data.get("prn", student.prn)
    student.email = data.get("email", student.email)
    student.password = data.get("password", student.password)
    student.mentor_id = data.get("mentor_id", student.mentor_id)
    student.github_link = data.get("github_link", student.github_link)

    db.commit()
    return {"message": "Student updated successfully"}

# -------------------------------
# MENTORS
# -------------------------------
@router.get("/mentors")
def get_mentors(db: Session = Depends(get_db)):
    return db.query(Mentor).all()

@router.post("/mentors")
def add_mentor(data: dict, db: Session = Depends(get_db)):
    mentor = Mentor(
        name=data["name"],
        email=data["email"],
        password=data["password"],
        department=data.get("department")
    )
    db.add(mentor)
    db.commit()
    db.refresh(mentor)
    return mentor

@router.delete("/mentors/{mentor_id}")
def delete_mentor(mentor_id: int, db: Session = Depends(get_db)):

    # 1. Delete all projects under this mentor
    db.query(Project).filter(Project.mentor_id == mentor_id).delete(synchronize_session=False)

    # 2. Unassign all students
    db.query(Student).filter(Student.mentor_id == mentor_id).update(
        {"mentor_id": None}
    )

    # 3. Delete the mentor
    mentor = db.query(Mentor).filter(Mentor.mentor_id == mentor_id).first()
    if not mentor:
        raise HTTPException(404, "Mentor not found")

    db.delete(mentor)
    db.commit()

    return {"message": "Mentor and all related projects deleted"}


@router.put("/reset-mentor-password/{mentor_id}")
def reset_mentor_password(mentor_id: int, data: dict, db: Session = Depends(get_db)):
    mentor = db.query(Mentor).filter(Mentor.mentor_id == mentor_id).first()
    if not mentor:
        raise HTTPException(404, "Mentor not found")

    mentor.password = data["password"]
    db.commit()
    return {"message": "Password updated"}

@router.put("/mentors/{mentor_id}")
def admin_update_mentor(mentor_id: int, data: dict, db: Session = Depends(get_db)):
    mentor = db.query(Mentor).filter(Mentor.mentor_id == mentor_id).first()

    if not mentor:
        raise HTTPException(404, "Mentor not found")

    mentor.name = data.get("name", mentor.name)
    mentor.email = data.get("email", mentor.email)
    mentor.department = data.get("department", mentor.department)
    mentor.password = data.get("password", mentor.password)

    db.commit()
    return {"message": "Mentor updated successfully"}


# -------------------------------
# PROJECTS
# -------------------------------
@router.get("/projects")
def get_projects(db: Session = Depends(get_db)):
    results = (
        db.query(Project, Student, Mentor)
        .join(Student, Project.student_id == Student.student_id)
        .outerjoin(Mentor, Project.mentor_id == Mentor.mentor_id)
        .all()
    )

    data = []
    for project, student, mentor in results:
        data.append({
            "id": project.id,
            "project_id": project.project_id,
            "title": project.title,
            "student_name": student.name,
            "mentor_name": mentor.name if mentor else None,
            "status": project.status,
            "github_link": project.github_link,
            "last_updated": project.last_updated
        })

    return data

