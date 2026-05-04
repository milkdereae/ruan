from fastapi import APIRouter, HTTPException
from models import ResponseModel, Category
from tools.redis_tool import get_category_list_from_cache, cache_category_list, get_category_count
from utils.logger import logger

category_router = APIRouter()


@category_router.get("/list", response_model=ResponseModel)
async def get_category_list():
    """获取所有分类"""
    try:
        # 先从Redis读取分类列表
        result = get_category_list_from_cache()
        
        # Redis中没有，则查询并缓存
        if result is None:
            result = await cache_category_list()
        
        # 为每个分类添加题目数量（从Redis读取）
        for category in result:
            # 先从Redis读取
            question_count = get_category_count(category['id'])
            
            # Redis中没有，则查询并缓存
            if question_count is None:
                question_count = await cache_category_count(category['id'])
                await refresh_category_counts()
                
            category['question_count'] = question_count
            
        
        # 按sort字段排序（保持原数据库排序）
        result.sort(key=lambda x: x['sort'], reverse=True)
        
        return ResponseModel(
            code=200,
            message="获取成功",
            data=result
        )
    except Exception as e:
        logger.error(f"获取分类列表失败: {e}")
        raise HTTPException(status_code=500, detail="获取分类列表失败")
