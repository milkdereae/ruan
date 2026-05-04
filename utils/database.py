import aiomysql
from config.settings import settings
from utils.logger import logger


async def get_db_connection():
    """获取 MySQL 数据库连接"""
    try:
        conn = await aiomysql.connect(
            host=settings.MYSQL_HOST,
            port=settings.MYSQL_PORT,
            user=settings.MYSQL_USER,
            password=settings.MYSQL_PASSWORD,
            db=settings.MYSQL_DATABASE,
            charset=settings.MYSQL_CHARSET,
            autocommit=False
        )
        return conn
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        raise e


async def execute_query(query: str, params: tuple = None):
    """执行查询"""
    conn = await get_db_connection()
    try:
        async with conn.cursor(aiomysql.DictCursor) as cursor:
            await cursor.execute(query, params)
            result = await cursor.fetchall()
            await conn.commit()
            return result
    except Exception as e:
        await conn.rollback()
        logger.error(f"Query execution error: {e}")
        raise e
    finally:
        conn.close()


async def execute_update(query: str, params: tuple = None):
    """执行更新/插入/删除"""
    conn = await get_db_connection()
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(query, params)
            await conn.commit()
            return cursor.rowcount
    except Exception as e:
        await conn.rollback()
        logger.error(f"Update execution error: {e}")
        raise e
    finally:
        conn.close()
