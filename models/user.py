from typing import Optional
from enum import Enum

from pydantic import BaseModel


class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"


class UserInfo(BaseModel):
    id:str 
    name: str
    created_at: str
    gender: Gender
    preferences: Optional[str] = None
    context: Optional[str] = None
    
