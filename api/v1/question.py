from fastapi import APIRouter, HTTPException, Query
from models import ResponseModel, QuestionWithCategory
from models.crud import QuestionCRUD
from tools.redis_tool import cache_question_detail, get_question_detail_from_cache, get_question_list_by_category
from utils.logger import logger

question_router = APIRouter()


@question_router.get("/list", response_model=ResponseModel)
async def get_question_list(
    cate_id: int = Query(..., description="分类ID"),
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量")
):
    """按分类分页获取题目"""
    try:
        # 先从Redis缓存获取
        result = await get_question_list_by_category(cate_id, page, page_size)
        if not result:
            result = await QuestionCRUD.get_list(cate_id, page, page_size)
            await cache_question_list_by_category(cate_id, page, page_size) 
        return ResponseModel(
            code=200,
            message="获取成功",
            data=result
        )
    except Exception as e:
        logger.error(f"获取题目列表失败: {e}")
        raise HTTPException(status_code=500, detail="获取题目列表失败")


@question_router.get("/random", response_model=ResponseModel)
async def get_random_questions(
    cate_id: int = Query(..., description="分类ID"),
    count: int = Query(10, ge=1, le=100, description="题目数量")
):
    """随机获取指定数量的题目"""
    try:
        result = await QuestionCRUD.get_random_list(cate_id, count)
        return ResponseModel(
            code=200,
            message="获取成功",
            data=result
        )
    except Exception as e:
        logger.error(f"获取随机题目失败: {e}")
        raise HTTPException(status_code=500, detail="获取随机题目失败")


@question_router.get("/detail", response_model=ResponseModel)
async def get_question_detail_endpoint(question_id: int = Query(..., description="题目ID")):
    """获取单题详情"""
    try:
        # 先从缓存读取
        result = get_question_detail_from_cache(question_id)
        
        # 缓存中没有，则查询并覆盖
        if result is None:
            result = await cache_question_detail(question_id)
        
        if not result:
            raise HTTPException(status_code=404, detail="题目不存在")
        
        return ResponseModel(
            code=200,
            message="获取成功",
            data=result
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取题目详情失败: {e}")
        raise HTTPException(status_code=500, detail="获取题目详情失败")
