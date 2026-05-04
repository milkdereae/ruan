import logging
from config.settings import settings


def setup_logger():
    """配置日志"""
    logging.basicConfig(
        level=logging.INFO if settings.DEBUG else logging.WARNING,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    return logging.getLogger(__name__)


logger = setup_logger()
