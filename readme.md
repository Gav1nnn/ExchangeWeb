# ExchangeApp

本仓库包含两个独立项目：

- `Exchangeapp_backend`：Go 后端服务
- `Exchangeapp_frontend`：Vue 3 前端应用

## 1. 项目概览

这是一个前后端分离应用，功能包括：

- 用户注册 / 登录
- JWT 鉴权 + 请求拦截
- 文章发布、编辑、删除、管理
- 文章点赞与缓存
- 汇率记录查询
- RAG 智能客服：基于站内文章的检索增强生成

## 2. 工作区域项目清单

- `Exchangeapp_backend`
  - 语言：Go
  - 框架：Gin
  - ORM：Gorm
  - 数据库：MySQL
  - 缓存：Redis
  - 认证：JWT + bcrypt
  - RAG：本地 Ollama / embedding + 关键字检索

- `Exchangeapp_frontend`
  - 语言：TypeScript / JavaScript
  - 框架：Vue 3
  - 构建工具：Vite
  - 状态管理：Pinia
  - 路由：Vue Router
  - HTTP 客户端：Axios
  - UI：Element Plus + Vant

## 3. 后端架构

### 3.1 目录结构

- `config/`：配置读取、MySQL 连接、Redis 连接
- `global/`：全局变量 `Db` 和 `RedisDB`
- `models/`：数据库模型 (`User`, `Article`, `ExchangeRate`)
- `controllers/`：业务层接口处理
- `middlewares/`：JWT 鉴权中间件
- `router/`：路由注册
- `services/`：RAG 搜索与生成逻辑
- `utils/`：密码哈希、JWT 生成与解析

### 3.2 核心功能

- `config.InitConfig()`：使用 Viper 读取 `config/config.yml`，支持环境变量覆盖
- `config.initDB()`：初始化 MySQL，并自动迁移 `User`, `Article`, `ExchangeRate`
- `config.InitRedis()`：初始化 Redis 客户端，用于缓存与 embedding 存储
- `middlewares.AuthMiddleware()`：检查 `Authorization` 头部 Token，解析用户名后写入上下文
- `controllers/auth_controller.go`：注册 / 登录，返回 JWT
- `controllers/article_controller.go`：文章 CRUD、缓存失效、点赞计数
- `controllers/exchange_rate_controller.go`：汇率创建与读取
- `services/rag_service.go`：RAG 检索 + 生成

### 3.3 重要路由

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/assistant/status`
- `POST /api/assistant/chat`
- `GET /api/exchangeRates`
- `POST /api/exchangeRates` (需要登录)
- `POST /api/articles` (需要登录)
- `GET /api/articles` (需要登录)
- `GET /api/my-articles` (需要登录)
- `GET /api/articles/:id` (需要登录)
- `PUT /api/articles/:id` (需要登录)
- `DELETE /api/articles/:id` (需要登录)
- `POST /api/articles/:id/like` (需要登录)
- `GET /api/articles/:id/like` (需要登录)

### 3.4 关键设计点

- `JWT` 认证：`utils.GenerateJWT()` 生成 token，`utils.ParseJWT()` 解析 token
- 文章列表缓存：`Redis` 存储 `articles` JSON，采用 Cache-Aside 模式
- 点赞缓存：使用 `Redis INCR` 方式实现高并发点赞计数
- 文章变更后：清除缓存并调用 `services.RAG.Invalidate()`，保证 RAG 索引刷新
- Graceful shutdown：后端 `main.go` 使用 `server.Shutdown()` 优雅退出

## 4. RAG 智能客服

后端 `services/rag_service.go` 是这个项目最重要的亮点。

### 4.1 RAG 流程

1. 从 MySQL 拉取所有文章
2. 将每篇文章拆成多个 chunk：标题 + 摘要 + 内容段落
3. 为每个 chunk 生成 `SearchText`、token、指纹
4. 如果配置了 embedding 模型，则调用 `embedTexts()` 为 chunk 生成向量
5. 将向量缓存到 Redis，避免重复计算
6. 检索阶段：
   - 先做关键词检索
   - 若有 embedding 配置，则再做 query embedding + 语义检索
   - 词法分数和语义分数混合排序
7. 生成阶段：将 top chunks 拼接成 prompt，调用 chat 接口生成回答

### 4.2 代码要点

- `tokenize()`：支持中文 `Han` 双字分词，也支持英文 token
- `lexicalScore()`：根据 query 与 chunk token 匹配打分，标题和摘要加权更高
- `cosineSimilarity()`：语义向量相似度计算
- `hydrateEmbeddings()`：批量生成 embedding、缓存 embedding、回退到词检索
- `generateWithChatCompletions()`：调用 `Ollama` 风格 `POST /api/chat`
- `extractChatMessageContent()`：兼容多种返回格式

### 4.3 默认配置

在 `config/config.yml` 中：

```yaml
rag:
  apiBase: http://localhost:11434
  apiKey: ""
  chatModel: qwen3.5:9b
  embeddingModel: nomic-embed-text
  topK: 3
  maxContextChars: 1800
  temperature: 0.2
```

可用环境变量覆盖：

- `EXCHANGEAPP_RAG_API_BASE`
- `EXCHANGEAPP_RAG_CHAT_MODEL`
- `EXCHANGEAPP_RAG_EMBEDDING_MODEL`
- `EXCHANGEAPP_RAG_API_KEY`

## 5. 前端架构

### 5.1 目录结构

- `src/main.ts`：应用入口，注册 Pinia、Element Plus、Vue Router
- `src/router/index.ts`：路由定义
- `src/store/auth.ts`：登录状态管理，保存 token
- `src/axios.ts`：全局 Axios 实例，自动挂载 Authorization 头
- `src/components/`：登录、注册组件
- `src/views/`：首页、汇率页面、新闻页面、智能助手、文章管理

### 5.2 页面功能

- `/`：首页
- `/exchange`：汇率查询
- `/news`：新闻列表
- `/assistant`：RAG 智能客服页面
- `/posts/new`：发布文章
- `/posts/manage`：我的文章管理
- `/posts/:id/edit`：编辑文章
- `/login`：登录
- `/register`：注册

### 5.3 前端关键点

- `axios` baseURL 为 `/api`，适配前后端同源代理或反向代理
- `Authorization` token 从 `localStorage` 读取并自动附加
- 登录/注册成功后，token 将写入 `localStorage`
- `Pinia` 负责全局认证状态和用户信息

## 6. 环境与运行

### 6.1 后端

1. 安装依赖：`go mod download`
2. 运行 MySQL、Redis
3. 根据 `config/config.yml` 配置数据库和 Redis
4. 启动后端：

```bash
cd Exchangeapp_backend
go run .
```

如果 3000 端口已被占用：

```bash
EXCHANGEAPP_PORT=:8080 go run .
```

### 6.2 前端

```bash
cd Exchangeapp_frontend
npm install
npm run dev
```

### 6.3 RAG 依赖

如果你使用 Ollama，本地服务需要可用：

```bash
ollama serve
ollama pull qwen3.5:9b
ollama pull nomic-embed-text
```