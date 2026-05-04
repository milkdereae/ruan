from pydantic import BaseModel, Field
from typing import Optional


class SendCodeRequest(BaseModel):
    """发送验证码请求"""
    email: str = Field(..., max_length=100, description="邮箱")


class RegisterWithCode(BaseModel):
    """带验证码的注册请求"""
    username: Optional[str] = Field(None, max_length=50, description="账号（默认为邮箱）")
    password: str = Field(..., max_length=100, description="密码")
    email: str = Field(..., max_length=50, description="邮箱")
    code: str = Field(..., max_length=6, description="验证码")
    nickname: Optional[str] = Field(None, max_length=50, description="昵称")
    avatar: Optional[str] = Field(None, max_length=255, description="头像")
