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
- 缓存失效策略
- CORS 支持
- 优雅退出

## Architecture

- RESTful API 设计
- JWT 鉴权流程
- Redis 原子自增点赞
- Cache-Aside 缓存模式
- context + server.Shutdown 优雅关闭

## Run

后端：

```bash
go run .
```
前端：

```bash
npm run dev
```