from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserRecordBase(BaseModel):
    """用户做题记录基础模型"""
    user_id: int = Field(..., description="用户ID")
    question_id: int = Field(..., description="题目ID")
    user_answer: Optional[str] = Field(None, max_length=1, description="用户答案")
    is_correct: int = Field(default=0, ge=0, le=1, description="是否正确 0错误 1正确")
    is_collect: int = Field(default=0, ge=0, le=1, description="是否收藏 0否 1是")


class UserRecordCreate(UserRecordBase):
    """创建做题记录"""
    pass


class UserRecordUpdate(BaseModel):
    """更新做题记录"""
    user_answer: Optional[str] = Field(None, max_length=1, description="用户答案")
    is_correct: Optional[int] = Field(None, ge=0, le=1, description="是否正确 0错误 1正确")
    is_collect: Optional[int] = Field(None, ge=0, le=1, description="是否收藏 0否 1是")


class UserRecord(UserRecordBase):
    """用户做题记录响应模型"""
    id: int
    update_time: datetime

    class Config:
        from_attributes = True


class UserRecordWithQuestion(UserRecord):
    """带题目信息的做题记录"""
    question_title: Optional[str] = None
    question_answer: Optional[str] = None
    category_name: Optional[str] = None


# 新增：不包含 user_id 的请求模型（用于从 token 获取用户ID）
class AnswerRequest(BaseModel):
    """答题请求"""
    question_id: int = Field(..., description="题目ID")
    user_answer: str = Field(..., max_length=1, description="用户答案 A/B/C/D")


class CollectRequest(BaseModel):
    """收藏请求"""
    question_id: int = Field(..., description="题目ID")
    is_collect: int = Field(..., ge=0, le=1, description="是否收藏 0否 1是")
