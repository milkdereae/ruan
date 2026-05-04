# FastAPI Project

一个基于 FastAPI 的 Web 应用框架。

## 项目结构

```
.
├── main.py              # 主应用文件
├── requirements.txt     # 依赖文件
├── config/              # 配置文件目录
│   ├── settings.py      # 配置类
│   └── .env.example     # 环境变量示例
├── api/                 # API 路由目录
│   └── router.py        # 路由定义
├── models/              # 数据模型目录
│   └── response.py      # 响应模型
├── utils/               # 工具函数目录
│   ├── logger.py        # 日志工具
│   └── helpers.py       # 辅助函数
└── README.md           # 项目说明
```

## 安装依赖

### 激活虚拟环境
```bash
# Windows
.\venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 安装依赖
```bash
pip install -r requirements.txt
```

## 运行应用

### 方式一：直接运行
```bash
python main.py
```

### 方式二：使用 uvicorn
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 访问文档

启动应用后，访问以下地址：

- API 文档: http://localhost:8000/docs
- ReDoc 文档: http://localhost:8000/redoc
- 健康检查: http://localhost:8000/api/health

## 配置

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp config/.env.example config/.env
```
