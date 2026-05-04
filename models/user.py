from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime


class UserBase(BaseModel):
    """用户基础模型"""
    username: str = Field(..., max_length=50, description="账号")
    password: str = Field(..., max_length=100, description="密码")
    email: str = Field(..., max_length=50, description="邮箱")
    nickname: Optional[str] = Field(None, max_length=50, description="昵称")
    avatar: Optional[str] = Field(None, max_length=255, description="头像")


class UserCreate(UserBase):
    """创建用户"""
    pass


class UserUpdate(BaseModel):
    """更新用户"""
    password: Optional[str] = Field(None, max_length=100, description="密码")
    email: Optional[str] = Field(None, max_length=50, description="邮箱")
    nickname: Optional[str] = Field(None, max_length=50, description="昵称")
    avatar: Optional[str] = Field(None, max_length=255, description="头像")


class UserLogin(BaseModel):
    """用户登录"""
    username: str = Field(..., max_length=50, description="账号")
    password: str = Field(..., max_length=100, description="密码")


class User(BaseModel):
    """用户响应模型"""
    id: int
    username: str
    email: str
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    create_time: datetime
    salt: str

    class Config:
        from_attributes = True


class UserWithoutPassword(BaseModel):
    """不包含密码的用户信息"""
    id: int
    username: str
    email: str
    nickname: Optional[str] = None
    avatar: Optional[str] = None
    create_time: datetime

    class Config:
        from_attributes = True
