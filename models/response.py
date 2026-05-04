from pydantic import BaseModel
from typing import Optional, Any, Generic, TypeVar

T = TypeVar('T')


class ResponseModel(BaseModel, Generic[T]):
    """统一响应模型"""
    code: int
    message: str
    data: Optional[T] = None


class User(BaseModel):
    """用户模型"""
    user_id: int
    name: str
    email: Optional[str] = None
