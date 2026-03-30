# Go ExchangeApp

基于 Go + Gin + Gorm + MySQL + Redis 实现的前后端分离 Web 应用，包含用户认证、文章管理与点赞缓存功能。

## Tech Stack

Backend:
- Go
- Gin
- Gorm
- MySQL
- Redis
- JWT
- bcrypt

Frontend:
- Vue
- Axios

## Features

- 用户注册 / 登录（JWT）
- 中间件鉴权
- 文章 CRUD
- Redis 点赞计数（INCR）
- 文章列表缓存（Cache-Aside）
- 基于站内文章的 RAG 智能金融客服
- 缓存失效策略
- CORS 支持
- 优雅退出

## Architecture

- RESTful API 设计
- JWT 鉴权流程
- Redis 原子自增点赞
- Cache-Aside 缓存模式
- 站内文章分块检索 + 引用式客服回答
- context + server.Shutdown 优雅关闭

## RAG Assistant

后端新增接口：

```bash
POST /api/assistant/chat
```

请求体：

```json
{
  "question": "美元走强会如何影响人民币？",
  "history": [
    { "role": "user", "content": "最近美元为什么偏强？" },
    { "role": "assistant", "content": "..." }
  ]
}
```

默认会基于站内文章做检索并返回引用。如果配置了外部大模型密钥，还会进入“检索增强生成”模式。

状态接口：

```bash
GET /api/assistant/status
```

它会返回当前客服是否已经启用生成模型、是否启用 embedding 检索、当前索引的文章片段数量等信息。

可选环境变量：

```bash
export EXCHANGEAPP_RAG_API_KEY=your_api_key
export EXCHANGEAPP_RAG_API_BASE=https://api.openai.com/v1
export EXCHANGEAPP_RAG_CHAT_MODEL=gpt-4.1-mini
export EXCHANGEAPP_RAG_EMBEDDING_MODEL=text-embedding-3-small
export EXCHANGEAPP_RAG_EMBEDDING_DIMS=1536
```

## Run

后端：

```bash
go run .
```
前端：

```bash
npm run dev
```
