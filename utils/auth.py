import secrets
import string
import hashlib
from utils.logger import logger


def generate_user_id(length: int = 4) -> str:
    """生成由数字和字母组成的用户ID"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def generate_salt(length: int = 10) -> str:
    """生成密码盐"""
    characters = string.ascii_letters + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def hash_password(password: str, salt: str = None) -> str:
    """加密密码 - 使用SHA256+salt，无长度限制"""
    if salt:
        # 使用SHA256哈希密码+salt
        password_salt_hash = hashlib.sha256((password + salt).encode()).hexdigest()
        return password_salt_hash
    # 使用SHA256哈希密码
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    return password_hash


def verify_password(plain_password: str, hashed_password: str, salt: str = None) -> bool:
    """验证密码"""
    if salt:
        # 使用SHA256哈希密码+salt
        password_salt_hash = hashlib.sha256((plain_password + salt).encode()).hexdigest()
        return password_salt_hash == hashed_password
    # 使用SHA256哈希密码
    password_hash = hashlib.sha256(plain_password.encode()).hexdigest()
    return password_hash == hashed_password
