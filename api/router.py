from fastapi import APIRouter
from models.response import ResponseModel
from api.v1.user import user_router
from api.v1.category import category_router
from api.v1.question import question_router
from api.v1.record import record_router

router = APIRouter()


@router.get("/", response_model=ResponseModel)
async def root():
    """根路径"""
    return ResponseModel(code=200, message="Welcome to FastAPI!", data=None)


@router.get("/health", response_model=ResponseModel)
async def health_check():
    """健康检查"""
    return ResponseModel(code=200, message="healthy", data={"status": "ok"})


@router.get("/users/{user_id}", response_model=ResponseModel)
async def get_user(user_id: int):
    """获取用户信息（示例）"""
    return ResponseModel(
        code=200,
        message="success",
        data={"user_id": user_id, "name": f"User {user_id}"}
    )

# 路由
router.include_router(user_router, prefix="/v1/user", tags=["用户"])
router.include_router(category_router, prefix="/v1/category", tags=["分类"])
router.include_router(question_router, prefix="/v1/question", tags=["题目"])
router.include_router(record_router, prefix="/v1/record", tags=["记录"])
