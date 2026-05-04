from datetime import datetime
from typing import Any


def get_timestamp() -> str:
    """获取当前时间戳"""
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def format_response(data: Any, message: str = "success", code: int = 200) -> dict:
    """格式化响应数据"""
    return {
        "code": code,
        "message": message,
        "data": data,
        "timestamp": get_timestamp()
    }
