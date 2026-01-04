from fastapi import FastAPI
from app.database import Base, engine
from app.routers import admin, student, faculty, projects, messages
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin.router, prefix="/admin")
app.include_router(student.router, prefix="/student")
app.include_router(faculty.router, prefix="/faculty")
app.include_router(projects.router, prefix="/projects")
app.include_router(messages.router, prefix="/messages")
