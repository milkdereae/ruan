from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CategoryBase(BaseModel):
    """分类基础模型"""
    name: str = Field(..., max_length=50, description="分类名称")
    sort: int = Field(default=0, description="排序")


class CategoryCreate(CategoryBase):
    """创建分类"""
    pass


class CategoryUpdate(BaseModel):
    """更新分类"""
    name: Optional[str] = Field(None, max_length=50, description="分类名称")
    sort: Optional[int] = Field(None, description="排序")


class Category(CategoryBase):
    """分类响应模型"""
    id: int
    create_time: datetime

    class Config:
        from_attributes = True
