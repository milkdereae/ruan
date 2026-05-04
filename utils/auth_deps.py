from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from utils.jwt_utils import verify_token
from utils.logger import logger

# HTTP Bearer 认证方案
security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """获取当前用户 - JWT认证依赖"""
    try:
        # 验证token
        payload = verify_token(credentials.credentials)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 获取用户ID
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="token中缺少用户ID",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return {
            "user_id": int(user_id),
            "username": payload.get("username")
        }
    
    except Exception as e:
        logger.error(f"JWT认证失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="认证失败",
            headers={"WWW-Authenticate": "Bearer"},
        )


async def get_current_user_optional(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """获取当前用户 - 可选JWT认证（不强制要求登录）"""
    try:
        # 验证token
        payload = verify_token(credentials.credentials)
        if payload is None:
            return None
        
        # 获取用户ID
        user_id = payload.get("sub")
        if user_id is None:
            return None
        
        return {
            "user_id": int(user_id),
            "username": payload.get("username")
        }
    
    except Exception:
        return None


# 简化的依赖函数，类似 FastAPI 官方示例
async def get_current_user_simple(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """获取当前用户 - 简化版JWT认证依赖"""
    try:
        # 验证token
        payload = verify_token(credentials.credentials)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的token",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 获取用户ID
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="token中缺少用户ID",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return {
            "user_id": int(user_id),
            "username": payload.get("username")
        }
    
    except Exception as e:
        logger.error(f"JWT认证失败: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="认证失败",
            headers={"WWW-Authenticate": "Bearer"},
        )
