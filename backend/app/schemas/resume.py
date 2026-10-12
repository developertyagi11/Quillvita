from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

SectionName = Literal["summary", "skills", "experience", "projects"]
ALL_SECTIONS: tuple[SectionName, ...] = ("summary", "skills", "experience", "projects")

ChangeSection = Literal["summary", "skills", "experience", "projects", "education"]


class BaseSchema(BaseModel):
    model_config = ConfigDict(extra="ignore", str_strip_whitespace=True)


class ContactInfo(BaseSchema):
    email: str = ""
    phone: str = ""
    location: str = ""
    links: list[str] = Field(default_factory=list)


class ExperienceEntry(BaseSchema):
    title: str
    company: str
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    bullets: list[str] = Field(default_factory=list)


class EducationEntry(BaseSchema):
    degree: str
    institution: str
    location: str = ""
    start_date: str = ""
    end_date: str = ""
    details: list[str] = Field(default_factory=list)


class ProjectEntry(BaseSchema):
    name: str
    description: str = ""
    technologies: list[str] = Field(default_factory=list)
    bullets: list[str] = Field(default_factory=list)
    link: str = ""


class ResumeContent(BaseSchema):
    name: str = Field(max_length=200)
    contact: ContactInfo = Field(default_factory=ContactInfo)
    summary: str = ""
    skills: list[str] = Field(default_factory=list)
    experience: list[ExperienceEntry] = Field(default_factory=list)
    education: list[EducationEntry] = Field(default_factory=list)
    projects: list[ProjectEntry] = Field(default_factory=list)
