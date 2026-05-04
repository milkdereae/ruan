from utils.logger import logger
from models.crud import QuestionCRUD, UserCRUD, CategoryCRUD
from typing import Optional, Dict, Any
import json
from utils.redis_client import RedisManager


async def cache_category_list() -> list:
    """缓存所有分类（强制覆盖）"""
    # 使用CRUD模型查询
    result = await CategoryCRUD.get_all()
    
    # 转换datetime为字符串
    from datetime import datetime
    def convert_datetime(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return obj
    
    # 存入Redis（强制覆盖）
    key = "category:list"
    RedisManager.set(key, json.dumps(result, ensure_ascii=False, default=convert_datetime))
    logger.info(f"已缓存{len(result)}个分类到Redis（强制覆盖）")
    return result


def get_category_list_from_cache() -> Optional[list]:
    """获取所有分类（从Redis读取）"""
    key = "category:list"
    value = RedisManager.get(key)
    return json.loads(value) if value else None


async def cache_category_count(category_id: int) -> int:
    """缓存分类题目数量（强制覆盖）
    
    Args:
        category_id: 分类ID
    """
    # 使用CRUD模型查询
    result = await QuestionCRUD.get_list(category_id, 1, 1)
    count = result['total']
    
    # 存入Redis（强制覆盖）
    key = f"category:count:{category_id}"
    RedisManager.set(key, str(count))
    logger.info(f"分类{category_id}题目数量已缓存到Redis（强制覆盖）")
    return count


def get_category_count(category_id: int) -> Optional[int]:
    """获取分类题目数量（从Redis读取）
    
    Args:
        category_id: 分类ID
    """
    key = f"category:count:{category_id}"
    value = RedisManager.get(key)
    return int(value) if value else None


async def refresh_category_counts():
    """刷新所有分类题目数量缓存"""
    # 清空所有分类缓存
    from models.crud import CategoryCRUD
    categories = await CategoryCRUD.get_all()
    
    for category in categories:
        key = f"category:count:{category['id']}"
        RedisManager.delete(key)
    
    logger.info("已清空所有分类题目数量缓存")


def clear_category_cache(category_id: int = None):
    """清除分类缓存"""
    if category_id:
        key = f"category:count:{category_id}"
        RedisManager.delete(key)
        logger.info(f"已清除分类{category_id}的缓存")
    else:
        from models.crud import CategoryCRUD
        import asyncio
        # 异步清除所有分类缓存
        async def clear_all():
            categories = await CategoryCRUD.get_all()
            for category in categories:
                key = f"category:count:{category['id']}"
                RedisManager.delete(key)
        
        # 在同步上下文中运行异步函数
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # 如果事件循环正在运行，创建任务
                loop.create_task(clear_all())
            else:
                loop.run_until_complete(clear_all())
        except:
            pass
        
        logger.info("已清除所有分类缓存")


async def cache_question_detail(question_id: int) -> Optional[Dict]:
    """缓存题目详情（强制覆盖）
    
    Args:
        question_id: 题目ID
    """
    # 使用CRUD模型查询
    result = await QuestionCRUD.get_by_id(question_id)
    
    if result:
        # 转换datetime为字符串
        from datetime import datetime
        def convert_datetime(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            return obj
        
        # 存入Redis（强制覆盖）
        key = f"question:detail:{question_id}"
        RedisManager.set(key, json.dumps(result, ensure_ascii=False, default=convert_datetime))
        logger.info(f"题目{question_id}已缓存到Redis（强制覆盖）")
        return result
    
    return None


def get_question_detail_from_cache(question_id: int) -> Optional[Dict]:
    """获取题目详情（从Redis读取）
    
    Args:
        question_id: 题目ID
    """
    key = f"question:detail:{question_id}"
    value = RedisManager.get(key)
    return json.loads(value) if value else None


async def warmup_questions():
    """预热所有题目和分类到Redis"""
    # 清空旧缓存
    import asyncio
    from datetime import datetime
    
    # datetime转换函数
    def convert_datetime(obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return obj
    
    # 预热分类列表
    await cache_category_list()
    
    # 获取所有分类
    categories = await CategoryCRUD.get_all()
    
    # 清空所有分类题目数量缓存
    for category in categories:
        key = f"category:count:{category['id']}"
        RedisManager.delete(key)
    
    total_count = 0
    
    # 遍历每个分类，获取所有题目
    for category in categories:
        cate_id = category['id']
        # 获取该分类所有题目（大页码）
        result = await QuestionCRUD.get_list(cate_id, 1, 10000)
        
        # 加载题目到Redis
        for question in result['list']:
            key = f"question:detail:{question['id']}"
            RedisManager.set(key, json.dumps(question, ensure_ascii=False, default=convert_datetime))
        
        # 预热分类题目数量
        count_key = f"category:count:{cate_id}"
        RedisManager.set(count_key, str(result['total']))
        
        total_count += len(result['list'])
    
    logger.info(f"已预热{total_count}道题目和{len(categories)}个分类到Redis缓存")
    return total_count


async def get_question_list_by_category(cate_id: int, page: int = 1, page_size: int = 10) -> Dict:
    """按分类分页获取题目列表（从缓存中筛选）
    
    Args:
        cate_id: 分类ID
        page: 页码
        page_size: 每页数量
    """
    # 由于Redis中没有直接按分类筛选的能力，这里从数据库查询
    # 但先尝试从缓存获取题目详情
    result = await QuestionCRUD.get_list(cate_id, page, page_size)
    
    # 从Redis中获取题目详情（如果有缓存则使用缓存）
    for question in result['list']:
        key = f"question:detail:{question['id']}"
        cached_value = RedisManager.get(key)
        if cached_value:
            cached_question = json.loads(cached_value)
            # 使用缓存的数据
            question.update(cached_question)
    
    return result


def clear_question_cache(question_id: int = None):
    """清除题目缓存"""
    if question_id:
        key = f"question:detail:{question_id}"
        RedisManager.delete(key)
        logger.info(f"已清除题目{question_id}的缓存")
    else:
        # 清除所有题目缓存比较复杂，这里简化处理
        logger.info("清除所有题目缓存需要手动处理")


async def cache_user_info(user_id: int) -> Optional[Dict]:
    """缓存用户信息（强制覆盖）
    
    Args:
        user_id: 用户ID
    """
    # 使用CRUD模型查询
    result = await UserCRUD.get_by_id(user_id)
    
    if result:
        # 转换datetime为字符串
        from datetime import datetime
        def convert_datetime(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            return obj
        
        # 存入Redis（强制覆盖）
        key = f"user:info:{user_id}"
        RedisManager.set(key, json.dumps(result, ensure_ascii=False, default=convert_datetime))
        logger.info(f"用户{user_id}信息已缓存到Redis（强制覆盖）")
        return result
    
    return None


def get_user_info_from_cache(user_id: int) -> Optional[Dict]:
    """获取用户信息（从Redis读取）
    
    Args:
        user_id: 用户ID
    """
    key = f"user:info:{user_id}"
    value = RedisManager.get(key)
    return json.loads(value) if value else None


def clear_user_cache(user_id: int = None):
    """清除用户缓存"""
    if user_id:
        key = f"user:info:{user_id}"
        RedisManager.delete(key)
        logger.info(f"已清除用户{user_id}的缓存")
    else:
        logger.info("清除所有用户缓存需要手动处理")
