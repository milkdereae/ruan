from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, EmailStr
from models import ResponseModel, UserCreate, UserLogin, UserWithoutPassword, SendCodeRequest, RegisterWithCode
from models.crud import UserCRUD
from tools.redis_tool import cache_user_info, get_user_info_from_cache
from utils.verification import generate_verification_code, save_verification_code, verify_code, check_verification_code_exists
from utils.email import send_email
from utils.auth import generate_user_id, generate_salt, hash_password, verify_password
from utils.jwt_utils import create_access_token
from utils.auth_deps import get_current_user
from utils.logger import logger

user_router = APIRouter()


@user_router.post("/send-code", response_model=ResponseModel)
async def send_code(request: SendCodeRequest):
    """发送验证码"""
    # 检查是否已有未过期的验证码
    remaining = check_verification_code_exists(request.email)
    if remaining is not None:
        return ResponseModel(
            code=400,
            message=f"验证码已发送，请等待{remaining}秒后重试",
            data={"remaining": remaining}
        )
    
    # 生成6位验证码
    code = generate_verification_code(6)
    
    # 保存验证码（5分钟过期）
    save_verification_code(request.email, code, 300)
    
    # 发送邮件
    subject = "注册验证码"
    content = f"您的注册验证码是：{code}，5分钟内有效。"
    success = await send_email(request.email, subject, content)
    
    if success:
        return ResponseModel(code=200, message="验证码已发送", data=None)
    else:
        return ResponseModel(code=500, message="验证码发送失败", data=None)


@user_router.post("/register", response_model=ResponseModel)
async def register(user: RegisterWithCode):
    """用户注册"""
    # 验证验证码
    if not verify_code(user.email, user.code):
        raise HTTPException(status_code=400, detail="验证码错误或已过期")
    
    # 如果username为空，默认使用email
    username = user.username if user.username else user.email
    
    # 检查用户名是否已存在
    existing_user = await UserCRUD.get_by_username(username)
    if existing_user:
        raise HTTPException(status_code=400, detail="用户名已存在")
    
    # 检查邮箱是否已存在
    existing_email = await UserCRUD.get_by_email(user.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="邮箱已被注册")
    
    # 生成salt
    salt = generate_salt(10)
    
    # 加密密码（使用salt）
    hashed_password = hash_password(user.password, salt)
    
    # 创建用户
    try:
        await UserCRUD.create(username, hashed_password, user.email, user.nickname, user.avatar, salt)
        
        # 获取新创建的用户信息
        new_user = await UserCRUD.get_by_username(username)
        
        return ResponseModel(
            code=200,
            message="注册成功",
            data=new_user
        )
    except Exception as e:
        logger.error(f"注册失败: {e}")
        raise HTTPException(status_code=500, detail="注册失败")


@user_router.post("/login", response_model=ResponseModel)
async def login(user: UserLogin):
    """用户登录"""
    # 查询用户
    db_user = await UserCRUD.get_by_username(user.username)
    
    if not db_user:
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    
    # 验证密码（使用salt）
    if not verify_password(user.password, db_user['password'], db_user['salt']):
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    
    # 创建JWT token
    access_token = create_access_token(data={"sub": str(db_user['id']), "username": db_user['username']})
    
    # 返回用户信息和token
    user_info = {
        "id": db_user['id'],
        "username": db_user['username'],
        "email": db_user['email'],
        "nickname": db_user['nickname'],
        "avatar": db_user['avatar'],
        "create_time": db_user['create_time'],
        "token": access_token
    }
    
    # 登录成功后缓存用户信息到Redis（强制覆盖）
    await cache_user_info(db_user['id'])
    
    return ResponseModel(
        code=200,
        message="登录成功",
        data=user_info
    )


@user_router.get("/info", response_model=ResponseModel)
async def get_user_info_endpoint(current_user: dict = Depends(get_current_user)):
    """获取用户信息"""
    try:
        # 直接使用当前登录用户的ID
        user_id = current_user["user_id"]
        
        # 先从缓存读取
        result = get_user_info_from_cache(user_id)
        
        # 缓存中没有，则查询并覆盖
        if result is None:
            result = await cache_user_info(user_id)
        
        if not result:
            raise HTTPException(status_code=404, detail="用户不存在")
        
        return ResponseModel(
            code=200,
            message="获取成功",
            data=result
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取用户信息失败: {e}")
        raise HTTPException(status_code=500, detail="获取用户信息失败")
