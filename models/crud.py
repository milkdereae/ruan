from typing import Optional, List, Dict, Any
from utils.database import execute_query, execute_update
from utils.logger import logger


class CategoryCRUD:
    """分类CRUD操作"""
    
    @staticmethod
    async def get_all() -> List[Dict]:
        """获取所有分类"""
        sql = "SELECT id, name, sort, create_time FROM category ORDER BY id ASC"
        result = await execute_query(sql)
        return result if result else []
    
    @staticmethod
    async def get_by_id(category_id: int) -> Optional[Dict]:
        """根据ID获取分类"""
        sql = "SELECT id, name, sort, create_time FROM category WHERE id = %s"
        result = await execute_query(sql, (category_id,))
        return result[0] if result else None
    
    @staticmethod
    async def create(name: str, sort: int = 0) -> int:
        """创建分类"""
        sql = "INSERT INTO category (name, sort) VALUES (%s, %s)"
        await execute_update(sql, (name, sort))
        return await execute_query("SELECT LAST_INSERT_ID() as id")
    
    @staticmethod
    async def update(category_id: int, name: Optional[str] = None, sort: Optional[int] = None) -> bool:
        """更新分类"""
        updates = []
        params = []
        
        if name is not None:
            updates.append("name = %s")
            params.append(name)
        if sort is not None:
            updates.append("sort = %s")
            params.append(sort)
        
        if not updates:
            return False
        
        params.append(category_id)
        sql = f"UPDATE category SET {', '.join(updates)} WHERE id = %s"
        await execute_update(sql, params)
        return True
    
    @staticmethod
    async def delete(category_id: int) -> bool:
        """删除分类"""
        sql = "DELETE FROM category WHERE id = %s"
        await execute_update(sql, (category_id,))
        return True


class QuestionCRUD:
    """题目CRUD操作"""
    
    @staticmethod
    async def get_list(cate_id: int, page: int = 1, page_size: int = 10) -> Dict:
        """分页获取题目列表"""
        offset = (page - 1) * page_size
        
        sql = """
            SELECT q.id, q.cate_id, q.title, 
                   IFNULL(q.option_a, '') as option_a,
                   IFNULL(q.option_b, '') as option_b,
                   IFNULL(q.option_c, '') as option_c,
                   IFNULL(q.option_d, '') as option_d,
                   q.answer, q.analysis, q.difficulty, q.create_time,
                   c.name as category_name
            FROM question q
            LEFT JOIN category c ON q.cate_id = c.id
            WHERE q.cate_id = %s
            ORDER BY q.id ASC
            LIMIT %s OFFSET %s
        """
        result = await execute_query(sql, (cate_id, page_size, offset))
        
        count_sql = "SELECT COUNT(*) as total FROM question WHERE cate_id = %s"
        count_result = await execute_query(count_sql, (cate_id,))
        total = count_result[0]['total'] if count_result else 0
        
        return {
            "list": result if result else [],
            "total": total,
            "page": page,
            "page_size": page_size
        }
    
    @staticmethod
    async def get_random_list(cate_id: int, count: int = 10) -> Dict:
        """随机获取指定数量的题目"""
        sql = """
            SELECT q.id, q.cate_id, q.title, 
                   IFNULL(q.option_a, '') as option_a,
                   IFNULL(q.option_b, '') as option_b,
                   IFNULL(q.option_c, '') as option_c,
                   IFNULL(q.option_d, '') as option_d,
                   q.answer, q.analysis, q.difficulty, q.create_time,
                   c.name as category_name
            FROM question q
            LEFT JOIN category c ON q.cate_id = c.id
            WHERE q.cate_id = %s
            ORDER BY RAND()
            LIMIT %s
        """
        result = await execute_query(sql, (cate_id, count))
        
        count_sql = "SELECT COUNT(*) as total FROM question WHERE cate_id = %s"
        count_result = await execute_query(count_sql, (cate_id,))
        total = count_result[0]['total'] if count_result else 0
        
        return {
            "list": result if result else [],
            "total": total,
            "count": count
        }
    
    @staticmethod
    async def get_by_id(question_id: int) -> Optional[Dict]:
        """根据ID获取题目详情"""
        sql = """
            SELECT q.id, q.cate_id, q.title, 
                   IFNULL(q.option_a, '') as option_a,
                   IFNULL(q.option_b, '') as option_b,
                   IFNULL(q.option_c, '') as option_c,
                   IFNULL(q.option_d, '') as option_d,
                   q.answer, q.analysis, q.difficulty, q.create_time,
                   c.name as category_name
            FROM question q
            LEFT JOIN category c ON q.cate_id = c.id
            WHERE q.id = %s
        """
        result = await execute_query(sql, (question_id,))
        return result[0] if result else None
    
    @staticmethod
    async def get_answer(question_id: int) -> Optional[str]:
        """获取题目正确答案"""
        sql = "SELECT answer FROM question WHERE id = %s"
        result = await execute_query(sql, (question_id,))
        return result[0]['answer'] if result else None
    
    @staticmethod
    async def create(cate_id: int, title: str, option_a: str = None, option_b: str = None, 
                    option_c: str = None, option_d: str = None, answer: str = None, 
                    analysis: str = None, difficulty: int = 1) -> int:
        """创建题目"""
        sql = """
            INSERT INTO question (cate_id, title, option_a, option_b, option_c, option_d, answer, analysis, difficulty)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        await execute_update(sql, (cate_id, title, option_a, option_b, option_c, option_d, answer, analysis, difficulty))
        return await execute_query("SELECT LAST_INSERT_ID() as id")
    
    @staticmethod
    async def update(question_id: int, **kwargs) -> bool:
        """更新题目"""
        updates = []
        params = []
        
        for key, value in kwargs.items():
            if value is not None:
                updates.append(f"{key} = %s")
                params.append(value)
        
        if not updates:
            return False
        
        params.append(question_id)
        sql = f"UPDATE question SET {', '.join(updates)} WHERE id = %s"
        await execute_update(sql, params)
        return True
    
    @staticmethod
    async def delete(question_id: int) -> bool:
        """删除题目"""
        sql = "DELETE FROM question WHERE id = %s"
        await execute_update(sql, (question_id,))
        return True


class UserRecordCRUD:
    """用户做题记录CRUD操作"""
    
    @staticmethod
    async def get_by_user_question(user_id: int, question_id: int) -> Optional[Dict]:
        """根据用户ID和题目ID获取记录"""
        sql = "SELECT id, user_id, question_id, user_answer, is_correct, is_collect, update_time FROM user_record WHERE user_id = %s AND question_id = %s"
        result = await execute_query(sql, (user_id, question_id))
        return result[0] if result else None
    
    @staticmethod
    async def create_or_update(user_id: int, question_id: int, user_answer: str = None, 
                              is_correct: int = 0, is_collect: int = 0) -> bool:
        """创建或更新记录"""
        existing = await UserRecordCRUD.get_by_user_question(user_id, question_id)
        
        if existing:
            # 更新
            updates = []
            params = []
            
            if user_answer is not None:
                updates.append("user_answer = %s")
                params.append(user_answer)
            if is_correct is not None:
                updates.append("is_correct = %s")
                params.append(is_correct)
            if is_collect is not None:
                updates.append("is_collect = %s")
                params.append(is_collect)
            
            if updates:
                params.extend([user_id, question_id])
                sql = f"UPDATE user_record SET {', '.join(updates)}, update_time = CURRENT_TIMESTAMP WHERE user_id = %s AND question_id = %s"
                await execute_update(sql, params)
        else:
            # 创建
            sql = "INSERT INTO user_record (user_id, question_id, user_answer, is_correct, is_collect) VALUES (%s, %s, %s, %s, %s)"
            await execute_update(sql, (user_id, question_id, user_answer, is_correct, is_collect))
        
        return True
    
    @staticmethod
    async def get_wrong_list(user_id: int, page: int = 1, page_size: int = 10) -> Dict:
        """获取错题列表"""
        offset = (page - 1) * page_size
        
        sql = """
            SELECT ur.id, ur.user_id, ur.question_id, ur.user_answer, ur.is_correct, ur.is_collect, ur.update_time,
                   q.title, q.option_a, q.option_b, q.option_c, q.option_d, q.answer, q.analysis, q.difficulty,
                   c.name as category_name
            FROM user_record ur
            LEFT JOIN question q ON ur.question_id = q.id
            LEFT JOIN category c ON q.cate_id = c.id
            WHERE ur.user_id = %s AND ur.is_correct = 0
            ORDER BY ur.update_time DESC
            LIMIT %s OFFSET %s
        """
        result = await execute_query(sql, (user_id, page_size, offset))
        
        count_sql = "SELECT COUNT(*) as total FROM user_record WHERE user_id = %s AND is_correct = 0"
        count_result = await execute_query(count_sql, (user_id,))
        total = count_result[0]['total'] if count_result else 0
        
        return {
            "list": result if result else [],
            "total": total,
            "page": page,
            "page_size": page_size
        }
    
    @staticmethod
    async def get_collect_list(user_id: int, page: int = 1, page_size: int = 10) -> Dict:
        """获取收藏列表"""
        offset = (page - 1) * page_size
        
        sql = """
            SELECT ur.id, ur.user_id, ur.question_id, ur.user_answer, ur.is_correct, ur.is_collect, ur.update_time,
                   q.title, q.option_a, q.option_b, q.option_c, q.option_d, q.answer, q.analysis, q.difficulty,
                   c.name as category_name
            FROM user_record ur
            LEFT JOIN question q ON ur.question_id = q.id
            LEFT JOIN category c ON q.cate_id = c.id
            WHERE ur.user_id = %s AND ur.is_collect = 1
            ORDER BY ur.update_time DESC
            LIMIT %s OFFSET %s
        """
        result = await execute_query(sql, (user_id, page_size, offset))
        
        count_sql = "SELECT COUNT(*) as total FROM user_record WHERE user_id = %s AND is_collect = 1"
        count_result = await execute_query(count_sql, (user_id,))
        total = count_result[0]['total'] if count_result else 0
        
        return {
            "list": result if result else [],
            "total": total,
            "page": page,
            "page_size": page_size
        }
    
    @staticmethod
    async def get_statistics(user_id: int) -> Dict:
        """获取刷题统计"""
        total_sql = "SELECT COUNT(*) as total FROM user_record WHERE user_id = %s"
        total_result = await execute_query(total_sql, (user_id,))
        total = total_result[0]['total'] if total_result else 0
        
        correct_sql = "SELECT COUNT(*) as correct FROM user_record WHERE user_id = %s AND is_correct = 1"
        correct_result = await execute_query(correct_sql, (user_id,))
        correct = correct_result[0]['correct'] if correct_result else 0
        
        wrong_sql = "SELECT COUNT(*) as wrong FROM user_record WHERE user_id = %s AND is_correct = 0"
        wrong_result = await execute_query(wrong_sql, (user_id,))
        wrong = wrong_result[0]['wrong'] if wrong_result else 0
        
        collect_sql = "SELECT COUNT(*) as collect FROM user_record WHERE user_id = %s AND is_collect = 1"
        collect_result = await execute_query(collect_sql, (user_id,))
        collect = collect_result[0]['collect'] if collect_result else 0
        
        accuracy = round((correct / total * 100) if total > 0 else 0, 2)
        
        return {
            "total": total,
            "correct": correct,
            "wrong": wrong,
            "collect": collect,
            "accuracy": accuracy
        }


class UserCRUD:
    """用户CRUD操作"""
    
    @staticmethod
    async def get_by_username(username: str) -> Optional[Dict]:
        """根据用户名获取用户"""
        sql = "SELECT id, username, password, email, nickname, avatar, create_time, salt FROM user WHERE username = %s"
        result = await execute_query(sql, (username,))
        return result[0] if result else None
    
    @staticmethod
    async def get_by_email(email: str) -> Optional[Dict]:
        """根据邮箱获取用户"""
        sql = "SELECT id FROM user WHERE email = %s"
        result = await execute_query(sql, (email,))
        return result[0] if result else None
    
    @staticmethod
    async def get_by_id(user_id: int) -> Optional[Dict]:
        """根据ID获取用户"""
        sql = "SELECT id, username, email, nickname, avatar, create_time FROM user WHERE id = %s"
        result = await execute_query(sql, (user_id,))
        return result[0] if result else None
    
    @staticmethod
    async def create(username: str, password: str, email: str, nickname: str = None, 
                    avatar: str = None, salt: str = None) -> int:
        """创建用户"""
        sql = "INSERT INTO user (username, password, email, nickname, avatar, salt) VALUES (%s, %s, %s, %s, %s, %s)"
        await execute_update(sql, (username, password, email, nickname, avatar, salt))
        return await execute_query("SELECT LAST_INSERT_ID() as id")
    
    @staticmethod
    async def update(user_id: int, **kwargs) -> bool:
        """更新用户"""
        updates = []
        params = []
        
        for key, value in kwargs.items():
            if value is not None:
                updates.append(f"{key} = %s")
                params.append(value)
        
        if not updates:
            return False
        
        params.append(user_id)
        sql = f"UPDATE user SET {', '.join(updates)} WHERE id = %s"
        await execute_update(sql, params)
        return True
