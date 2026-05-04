from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from api.router import router
from config.settings import settings
from utils.logger import logger
from tools.redis_tool import warmup_questions


@asynccontextmanager
async def lifespan(app: FastAPI):
    """应用生命周期管理"""
    # 启动时预热Redis缓存
    logger.info("开始预热Redis缓存...")
    await warmup_questions()
    logger.info("Redis缓存预热完成")
    
    yield
    
    # 关闭时的清理工作
    logger.info("应用关闭")


app = FastAPI(
    title=settings.APP_NAME,
    description="A FastAPI application framework",
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    docs_url=settings.DOCS_URL if settings.DOCS_URL != "None" else None,
    redoc_url=settings.REDOC_URL if settings.REDOC_URL != "None" else None,
    openapi_url=settings.OPENAPI_URL if settings.OPENAPI_URL != "None" else None,
    lifespan=lifespan
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(router, prefix="/api")

# 挂载静态图片目录
app.mount("/decoration", StaticFiles(directory="api/pic/decoration"), name="decoration")
app.mount("/profile", StaticFiles(directory="api/pic/profile"), name="profile")

logger.info(f"Application {settings.APP_NAME} v{settings.APP_VERSION} started")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT)
