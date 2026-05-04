import redis
from config.settings import settings
from utils.logger import logger

# Redis 连接池
redis_pool = redis.ConnectionPool(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
    db=settings.REDIS_DB,
    decode_responses=settings.REDIS_DECODE_RESPONSES,
    max_connections=10
)

# Redis 客户端
redis_client = redis.Redis(connection_pool=redis_pool)


def get_redis():
    """获取 Redis 客户端"""
    try:
        redis_client.ping()
        return redis_client
    except Exception as e:
        logger.error(f"Redis connection error: {e}")
        raise e


class RedisManager:
    """Redis 管理类"""
    
    @staticmethod
    def set(key: str, value: str, ex: int = None):
        """设置键值"""
        try:
            return redis_client.set(key, value, ex=ex)
        except Exception as e:
            logger.error(f"Redis set error: {e}")
            return None
    
    @staticmethod
    def get(key: str):
        """获取值"""
        try:
            return redis_client.get(key)
        except Exception as e:
            logger.error(f"Redis get error: {e}")
            return None
    
    @staticmethod
    def delete(key: str):
        """删除键"""
        try:
            return redis_client.delete(key)
        except Exception as e:
            logger.error(f"Redis delete error: {e}")
            return None
    
    @staticmethod
    def exists(key: str):
        """检查键是否存在"""
        try:
            return redis_client.exists(key)
        except Exception as e:
            logger.error(f"Redis exists error: {e}")
            return False
    
    @staticmethod
    def expire(key: str, time: int):
        """设置过期时间"""
        try:
            return redis_client.expire(key, time)
        except Exception as e:
            logger.error(f"Redis expire error: {e}")
            return None
