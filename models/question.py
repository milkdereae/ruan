from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class QuestionBase(BaseModel):
    """题目基础模型"""
    cate_id: int = Field(..., description="分类ID")
    title: str = Field(..., description="题目内容")
    option_a: Optional[str] = Field(None, max_length=255, description="选项A")
    option_b: Optional[str] = Field(None, max_length=255, description="选项B")
    option_c: Optional[str] = Field(None, max_length=255, description="选项C")
    option_d: Optional[str] = Field(None, max_length=255, description="选项D")
    answer: str = Field(..., max_length=1, description="正确答案 A/B/C/D")
    analysis: Optional[str] = Field(None, description="题目解析")
    difficulty: int = Field(default=1, ge=1, le=3, description="难度 1简单 2中等 3困难")


class QuestionCreate(QuestionBase):
    """创建题目"""
    pass


class QuestionUpdate(BaseModel):
    """更新题目"""
    cate_id: Optional[int] = Field(None, description="分类ID")
    title: Optional[str] = Field(None, description="题目内容")
    option_a: Optional[str] = Field(None, max_length=255, description="选项A")
    option_b: Optional[str] = Field(None, max_length=255, description="选项B")
    option_c: Optional[str] = Field(None, max_length=255, description="选项C")
    option_d: Optional[str] = Field(None, max_length=255, description="选项D")
    answer: Optional[str] = Field(None, max_length=1, description="正确答案 A/B/C/D")
    analysis: Optional[str] = Field(None, description="题目解析")
    difficulty: Optional[int] = Field(None, ge=1, le=3, description="难度 1简单 2中等 3困难")


class Question(QuestionBase):
    """题目响应模型"""
    id: int
    create_time: datetime

    class Config:
        from_attributes = True


class QuestionWithCategory(Question):
    """带分类信息的题目"""
    category_name: Optional[str] = None
