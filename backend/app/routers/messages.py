from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Message

router = APIRouter()

@router.post("/")
def send_message(data: dict, db: Session = Depends(get_db)):
    msg = Message(**data)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {"message": "Message sent", "data": msg}

@router.get("/project/{project_id}")
def get_project_messages(project_id: int, db: Session = Depends(get_db)):
    return db.query(Message).filter(Message.project_id == project_id).all()
