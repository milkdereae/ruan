import aiosmtplib
from email.message import EmailMessage
from config.settings import settings
from utils.logger import logger


async def send_email(to_email: str, subject: str, content: str):
    """发送邮件"""
    message = EmailMessage()
    message["From"] = settings.EMAIL_FROM
    message["To"] = to_email
    message["Subject"] = subject
    message.set_content(content)
    
    try:
        await aiosmtplib.send(
            message,
            hostname=settings.EMAIL_HOST,
            port=settings.EMAIL_PORT,
            username=settings.EMAIL_USER,
            password=settings.EMAIL_PASSWORD,
            start_tls=True
        )
        logger.info(f"邮件发送成功: {to_email}")
        return True
    except Exception as e:
        logger.error(f"邮件发送失败: {e}")
        return False
