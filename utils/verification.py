import secrets
import string
import time
from typing import Optional
from utils.logger import logger

# 使用内存字典存储验证码（替代Redis）
verification_codes = {}


def generate_verification_code(length: int = 6) -> str:
    """生成验证码"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def save_verification_code(email: str, code: str, expire_seconds: int = 300):
    """保存验证码（默认5分钟）"""
    verification_codes[email] = {
        "code": code,
        "expire_time": time.time() + expire_seconds
    }
    logger.info(f"验证码已保存: {email}, 过期时间: {expire_seconds}秒")


def get_verification_code(email: str) -> Optional[str]:
    """获取验证码"""
    if email not in verification_codes:
        return None
    
    data = verification_codes[email]
    
    # 检查是否过期
    if time.time() > data["expire_time"]:
        del verification_codes[email]
        return None
    
    return data["code"]


def check_verification_code_exists(email: str) -> Optional[int]:
    """检查验证码是否存在，返回剩余秒数"""
    if email not in verification_codes:
        return None
    
    data = verification_codes[email]
    remaining = int(data["expire_time"] - time.time())
    
    if remaining <= 0:
        del verification_codes[email]
        return None
    
    return remaining


def verify_code(email: str, code: str) -> bool:
    """验证验证码"""
    stored_code = get_verification_code(email)
    if stored_code is None:
        return False
    
    if stored_code == code:
        # 验证成功后删除验证码
        del verification_codes[email]
        return True
    
    return False
