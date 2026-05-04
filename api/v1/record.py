from fastapi import APIRouter, HTTPException, Depends, Query
from models import ResponseModel, UserRecordWithQuestion, AnswerRequest, CollectRequest
from models.crud import UserRecordCRUD, QuestionCRUD
from utils.auth_deps import get_current_user
from utils.logger import logger

record_router = APIRouter()


@record_router.post("/answer", response_model=ResponseModel)
async def submit_answer(
    request: AnswerRequest,
    current_user: dict = Depends(get_current_user)
):
    """提交答题记录"""
    try:
        # 直接使用当前登录用户的ID
        user_id = current_user["user_id"]
        
        # 获取题目正确答案
        correct_answer = await QuestionCRUD.get_answer(request.question_id)
        
        if not correct_answer:
            raise HTTPException(status_code=404, detail="题目不存在")
        
        is_correct = 1 if request.user_answer == correct_answer else 0
        
        # 创建或更新记录
        await UserRecordCRUD.create_or_update(
            user_id, request.question_id, request.user_answer, is_correct
        )
        
        return ResponseModel(
            code=200,
            message="提交成功",
            data={"is_correct": is_correct, "correct_answer": correct_answer}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"提交答题记录失败: {e}")
        raise HTTPException(status_code=500, detail="提交答题记录失败")


@record_router.get("/wrong-list", response_model=ResponseModel)
async def get_wrong_list(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    current_user: dict = Depends(get_current_user)
):
    """获取错题列表"""
    try:
        # 直接使用当前登录用户的ID
        user_id = current_user["user_id"]
        
        result = await UserRecordCRUD.get_wrong_list(user_id, page, page_size)
        
        return ResponseModel(
            code=200,
            message="获取成功",
            data=result
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取错题列表失败: {e}")
        raise HTTPException(status_code=500, detail="获取错题列表失败")


@record_router.post("/collect", response_model=ResponseModel)
async def toggle_collect(
    request: CollectRequest,
    current_user: dict = Depends(get_current_user)
):
    """收藏/取消收藏题目"""
    try:
        # 直接使用当前登录用户的ID
        user_id = current_user["user_id"]
        
        await UserRecordCRUD.create_or_update(
            user_id, request.question_id, is_collect=request.is_collect
        )
        
        return ResponseModel(
            code=200,
            message="操作成功",
            data={"is_collect": request.is_collect}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"收藏操作失败: {e}")
        raise HTTPException(status_code=500, detail="收藏操作失败")


@record_router.get("/collect-list", response_model=ResponseModel)
async def get_collect_list(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    current_user: dict = Depends(get_current_user)
):
    """获取收藏列表"""
    try:
        # 直接使用当前登录用户的ID
        user_id = current_user["user_id"]
        
        result = await UserRecordCRUD.get_collect_list(user_id, page, page_size)
        
        return ResponseModel(
            code=200,
            message="获取成功",
            data=result
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取收藏列表失败: {e}")
        raise HTTPException(status_code=500, detail="获取收藏列表失败")


@record_router.get("/stat", response_model=ResponseModel)
async def get_statistics(current_user: dict = Depends(get_current_user)):
    """获取刷题统计"""
    try:
        # 直接使用当前登录用户的ID
        user_id = current_user["user_id"]
        
        result = await UserRecordCRUD.get_statistics(user_id)
        
        return ResponseModel(
            code=200,
            message="获取成功",
            data=result
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取刷题统计失败: {e}")
        raise HTTPException(status_code=500, detail="获取刷题统计失败")
