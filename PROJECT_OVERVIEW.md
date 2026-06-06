# isME 个人网站 · 项目交接文档

> 本文件供新会话快速了解项目全貌、约定与注意事项。最后更新：2026-06-06。
> 阅读对象：接手本项目的 AI 助手 / 开发者。请先通读「关键约定与坑」一节再动手改代码。

---

## 1. 项目概述

前后端分离的个人网站（博客 + 后台管理 + 展示页），已通过 Docker + GitHub Actions 部署到国内云服务器，走 HTTPS。

- 仓库：`liu-gaoleng/isME`（GitHub，**public 公开只读**，默认分支 `main`）
- 线上域名：`https://liuxxs.com`（注意：ICP 备案合规期间 DNS 可能被暂停，部署用服务器公网 IP `101.42.35.163` 绕过）
- 服务器：腾讯云轻量（国内）

### 技术栈

**前端**
- Next.js 16（App Router）、React 19、TypeScript 5、Tailwind CSS 4
- Tiptap 富文本编辑器（`@tiptap/react` / `starter-kit` / `extension-image` / `extension-link`，均 `^3.26.0`）
- Supabase JS（`@supabase/supabase-js`）—— 仅用于「笔记」页评论，独立于后端

**后端**
- Spring Boot 3.2.5、Spring Security、Spring Data JPA、JWT
- MySQL 8.0（生产 9.x 亦可）、Flyway 数据库迁移
- SpringDoc OpenAPI（Swagger UI）
- Lombok

**基础设施**
- Docker / Docker Compose、Nginx 反向代理、Let's Encrypt HTTPS
- GitHub Actions（CI + Deploy 两个 workflow）
- 阿里云容器镜像服务 ACR（国内拉镜像快，替代 GHCR）

---

## 2. 目录结构（关键部分）

```
isME/
├── app/                         # Next.js App Router 页面
│   ├── page.tsx                 # 首页（已移除产品板块）
│   ├── about/                   # 关于
│   ├── blog/page.tsx            # “产品”展示页（静态作品集，非博客列表！见下方说明）
│   ├── notes/                   # 笔记列表 + [id] 详情（含 Supabase 评论）
│   ├── hobbies/                 # 爱好
│   ├── login/page.tsx           # 登录页
│   └── admin/                   # 后台管理（需登录 + ADMIN）
│       ├── layout.tsx           # 后台顶部 tab 导航
│       ├── page.tsx             # 总览
│       ├── articles/            # 文章管理：列表 / create / [id]/edit
│       ├── categories/page.tsx  # 分类管理 CRUD
│       ├── comments/page.tsx    # 评论管理（三态审核）
│       └── users/page.tsx       # 用户管理（增删改/角色/启停/重置密码）
├── components/                  # React 组件（Navbar/Footer/RichTextEditor/NoteCommentsLayer 等）
├── lib/
│   ├── api/                     # 后端 API 调用层（client.ts 是核心）
│   │   ├── client.ts            # fetch 封装 + 统一响应/401 处理 + upload()
│   │   ├── config.ts            # API_BASE_URL + API_ENDPOINTS
│   │   ├── article/category/comment/auth.ts
│   │   └── hooks.ts
│   ├── supabaseClient.ts        # Supabase 客户端（仅笔记评论用）
│   ├── comments.ts / notes.ts   # 笔记 & 笔记评论数据层（走 Supabase）
│   └── useScrollReveal.ts
├── backend/
│   ├── src/main/java/com/personalsite/
│   │   ├── config/              # Security/Cors/WebMvc/OpenApi/AdminInitializer
│   │   ├── controller/          # REST API
│   │   ├── dto/                 # ApiResponse / 各 DTO
│   │   ├── entity/              # Article/Category/Comment/Tag/User
│   │   ├── exception/           # BusinessException + GlobalExceptionHandler
│   │   ├── filter/              # RequestLoggingFilter
│   │   ├── repository/          # JPA Repository
│   │   ├── security/            # JwtUtil / JwtAuthenticationFilter / CustomUserDetailsService
│   │   └── service/             # 业务逻辑
│   ├── src/main/resources/
│   │   ├── application.yml
│   │   ├── db/migration/        # Flyway：V1__init_schema.sql, V2__seed_reference_data.sql
│   │   └── logback-spring.xml
│   ├── src/test/                # JUnit + Mockito 单测（UserServiceTest / JwtUtilTest）
│   ├── Dockerfile
│   └── pom.xml
├── nginx/nginx.conf
├── scripts/compress-images.mjs  # 一次性图片压缩脚本（mozjpeg q80，保留备用）
├── supabase/schema.sql          # 笔记评论表结构
├── .github/workflows/           # ci.yml + deploy.yml
├── docker-compose.yml           # 本地开发
├── docker-compose.prod.yml      # 生产
├── Dockerfile.frontend
├── .env.example
└── PROJECT_OVERVIEW.md          # 本文件
```

---

## 3. 本地启动

后端（terminal 已有运行实例，端口 8080）：
```bash
cd backend
export JAVA_HOME=/Users/bytedance/Library/Java/JavaVirtualMachines/ms-17.0.19/Contents/Home
SPRING_DATASOURCE_URL='jdbc:mysql://localhost:3306/personal_site?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true' \
SPRING_DATASOURCE_USERNAME=root SPRING_DATASOURCE_PASSWORD=root123 \
JWT_SECRET='dev-local-jwt-secret-key-please-change-in-prod-2026' \
APP_CORS_ALLOWED_ORIGINS='http://localhost:3000' \
mvn spring-boot:run -DskipTests -q
```
- 若端口 8080 被占用：`lsof -ti:8080 | xargs kill -9` 后重启
- 本地需先有 MySQL 库 `personal_site`，Flyway 会自动建表/灌种子数据
- 后端起在 http://localhost:8080 ，Swagger UI: http://localhost:8080/swagger-ui/index.html

前端（端口 3000，dev server 支持热更新）：
```bash
npm install
npm run dev
```
- 前端环境变量 `NEXT_PUBLIC_API_URL`（默认 `http://localhost:8080`）

跑测试 / Lint：
```bash
cd backend && mvn test        # 13 个单测
npm run lint                  # 前端 ESLint（见第 9 节）
```

---

## 4. 后端架构与约定

### 统一响应封装 `ApiResponse<T>`
所有后端接口（**含登录**）统一返回：
```json
{ "code": 200, "message": "...", "data": {...}, "timestamp": 1700000000 }
```
前端 [client.ts](file:///Users/bytedance/liu/isME/lib/api/client.ts) 的 `handleResponse` 依赖 `code === 200` 判断成功。
> 坑：曾经 AuthController 的 login 直接返回未包装的对象导致前端「Request failed」。**新增任何接口务必用 ApiResponse 包装**。

### 统一异常处理
- 业务错误一律抛 `BusinessException` → `GlobalExceptionHandler` 转 **HTTP 400** + ApiResponse。
- **不要在 Service 里抛裸 `RuntimeException`**（会变 500）。
- `@Valid` 校验失败也由 GlobalExceptionHandler 统一处理。
- 已知技术债：「资源不存在」按语义应是 404，目前统一 400，够用，未改。

### 鉴权（当前实现：JWT + HttpOnly Cookie + CSRF 双重提交）
- 登录 `POST /api/auth/login`：JWT 写入 **HttpOnly Cookie**（`accessToken`，`SameSite=Lax`，生产 `Secure`），响应体只返回 `user`，**不再返回 token**。前端 JS 读不到凭证（防 XSS 窃取）。
- 登出 `POST /api/auth/logout`：后端下发 `Max-Age=0` 同名 Cookie 清除登录态。
- 当前用户 `GET /api/auth/me`（`authenticated()`）：前端路由守卫与「当前账号」判断改为调此接口（HttpOnly Cookie 前端读不到，故不能再用 localStorage）。
- [JwtAuthenticationFilter](file:///Users/bytedance/liu/isME/backend/src/main/java/com/personalsite/security/JwtAuthenticationFilter.java) 从 Cookie `accessToken` 读 JWT（不再读 `Authorization: Bearer`）。
- **CSRF 已启用**：`CookieCsrfTokenRepository.withHttpOnlyFalse()` 下发非 HttpOnly 的 `XSRF-TOKEN` cookie，前端写请求（POST/PUT/DELETE）从 cookie 读出并回传 `X-XSRF-TOKEN` 头。免 CSRF 名单：`/api/auth/login`、`/api/auth/logout`、`POST /api/comments`、`POST /api/articles/*/view`。
- Cookie 行为由 `app.cookie.secure`（生产 `COOKIE_SECURE=true`）、`app.cookie.same-site`（默认 `Lax`）控制。注意 `jwt.expiration` 配置以**秒**为单位（JwtUtil 用 `*1000`），Cookie maxAge 用 `Duration.ofSeconds` 对齐。
- 前端 [client.ts](file:///Users/bytedance/liu/isME/lib/api/client.ts) 所有请求带 `credentials: 'include'`；401 处理：不在 /login 页则跳登录（不再依赖 localStorage）。403 不跳转。
- **公开注册已关闭**：建用户只能由 ADMIN 调 `/api/users`。
- 默认管理员由 [AdminInitializer](file:///Users/bytedance/liu/isME/backend/src/main/java/com/personalsite/config/AdminInitializer.java) 启动时创建，账号/邮箱/密码走环境变量（默认 `admin`/`admin123`，**线上已改强密码**）。

### Security 路由规则（[SecurityConfig](file:///Users/bytedance/liu/isME/backend/src/main/java/com/personalsite/config/SecurityConfig.java)）
- 公开：`POST /api/auth/login`、`POST /api/auth/logout`、Swagger、`GET /uploads/**`、`GET /api/{articles,categories,comments,public}/**`
- 公开写：`POST /api/articles/*/view`（浏览计数）、`POST /api/comments`（访客评论）
- 仅 ADMIN：`GET /api/articles/admin/**`、`GET /api/comments/pending`、`GET /api/comments/admin/**`，以及 `anyRequest()` 兜底
- **顺序敏感**：ADMIN 的 GET 规则必须声明在公开 GET 通配之前，否则被提前放行。

### JPA / 数据库
- `ddl-auto: validate`（**不自动改表**），schema 全由 **Flyway** 管理（`db/migration/V*.sql`）。
- 改表结构 = 新增 `V{n}__xxx.sql`，**不要改已执行过的迁移文件**。
- `open-in-view: false`：LAZY 关联必须在 Service 层 `@Transactional` 内显式加载，否则报 LazyInitializationException。
- 类级 `@Transactional(readOnly=true)`，写方法单独标 `@Transactional`。

### DTO 安全
- `UserDTO.password` 加了 `@JsonProperty(access = WRITE_ONLY)`，只入不出，防序列化泄露。
- Controller 入参统一加 `@Valid`，DTO 用 `@NotBlank/@Size` 校验。
  > 坑：`ArticleDTO.slug` **不要加 @NotBlank**——slug 可留空，由 `ArticleService.normalizeSlug` 基于标题自动生成并保证唯一。

### 文件上传（[UploadController](file:///Users/bytedance/liu/isME/backend/src/main/java/com/personalsite/controller/UploadController.java)）
- `POST /api/upload/image`（需 ADMIN），校验类型（jpg/png/webp/gif）+ 大小（≤5MB）+ 随机文件名 + 按日期分目录 + 防路径穿越。
- 静态访问：[WebMvcConfig](file:///Users/bytedance/liu/isME/backend/src/main/java/com/personalsite/config/WebMvcConfig.java) 映射 `/uploads/**` → 上传目录（`app.upload.dir`，生产挂 `uploads_data` 卷）。
- 返回相对 url，前端用 `${API_BASE_URL}${url}` 拼完整地址。

---

## 5. 前端架构与约定

- API 调用统一走 [lib/api/client.ts](file:///Users/bytedance/liu/isME/lib/api/client.ts) 的 `get/post/put/del/upload`，不要直接写 fetch。
- 端点集中在 [lib/api/config.ts](file:///Users/bytedance/liu/isME/lib/api/config.ts) 的 `API_ENDPOINTS`。
- 后台列表要显示**草稿**时调 `/api/articles/admin/all`（`/api/articles` 只返回已发布）。
- 富文本编辑器 [RichTextEditor.tsx](file:///Users/bytedance/liu/isME/components/RichTextEditor.tsx)：
  - `immediatelyRender: false`（SSR 必需）。
  - 内容同步 useEffect **必须带 `!editor.isFocused` 条件**，否则打字时 setContent 会重置内容（曾导致「输入双击才显示 / 内容被清空」bug）。
- 全局 CSS（globals.css）设了白色字体，**后台 / 登录等白底页面的根容器要加 `text-gray-900` 覆盖**，否则白字白底看不见（已修 admin/layout 与 login）。

### 页面语义（重要，别理解错）
- `/blog` 是**「产品」展示页**：已从博客文章列表改造为**静态产品作品集**（独立大卡片：rounded-3xl + 渐变色带 + 投影），内容基于真实数仓项目，详情外链 GitHub。**不再是文章列表**，`/blog/[slug]` 详情页已删除。
- 首页已**移除产品板块**。
- 文章模块定位为**方向 A：后台内容库**——后台 CRUD/富文本/上传齐全，但目前**无公开展示页**（半成品，用户确认暂不对外）。
- 「笔记」页评论用 **Supabase**，与 Spring 后端的 comment 模块**互相独立**，不要混淆。

---

## 6. CI/CD

两个 workflow（**push 到 main 会同时触发，互相独立**）：

| | [ci.yml](file:///Users/bytedance/liu/isME/.github/workflows/ci.yml) | [deploy.yml](file:///Users/bytedance/liu/isME/.github/workflows/deploy.yml) |
|---|---|---|
| 目的 | 质量门禁：构建+测试 | 构建镜像→推 ACR→SSH 上线 |
| 触发 | push main + pull_request | push main + workflow_dispatch |
| 内容 | 后端 `mvn clean verify`（含单测）+ 前端 lint/build | Docker 镜像 build/push + 服务器拉取重启 |
| 碰服务器 | 否 | 是 |

- **Deploy 当前不依赖 CI 通过**（即使 CI 测试挂了 Deploy 也会照常部署）。单人项目可接受，要更严谨可让 deploy `needs` ci。
- Deploy 流程：build-and-push（ACR 登录→构建前后端镜像，tag=latest+sha）→ deploy（SSH 到服务器 `git pull` 配置 + `docker compose -f docker-compose.prod.yml pull/up -d`，用 `IMAGE_TAG=github.sha`）。
- **镜像不进 Git**，服务器只 `git pull` 拉 compose/nginx 等配置文件。
- 部署失败排查记录：`SSH_HOST` secret 曾填域名，DNS 被备案暂停导致 `no such host`→改成服务器 IP `101.42.35.163` 解决。

### 涉及的 GitHub Secrets / Vars
Secrets：`ACR_REGISTRY` `ACR_NAMESPACE` `ACR_USERNAME` `ACR_PASSWORD`、`SSH_HOST`(填IP) `SSH_USER` `SSH_KEY` `SSH_PORT` `DEPLOY_PATH`。Vars：`PROD_API_URL`（默认 `https://liuxxs.com`）。

---

## 7. 部署与环境变量

- 生产配置 [docker-compose.prod.yml](file:///Users/bytedance/liu/isME/docker-compose.prod.yml)：backend 挂 `uploads_data` 卷 + `APP_UPLOAD_DIR`；DB 密码等用 `${VAR:?}` 强制注入（缺失即报错）。
- [.env.example](file:///Users/bytedance/liu/isME/.env.example) 是模板（含 `ACR_REGISTRY/ACR_NAMESPACE` 等），真实 `.env` **不提交**（已在 .gitignore）。
- 后端配置见 [application.yml](file:///Users/bytedance/liu/isME/backend/src/main/resources/application.yml)，敏感项全走环境变量，冒号默认值仅本地用。
- 运行时上传目录 `backend/uploads/` 已加入 .gitignore。
- Nginx 已配 `/uploads/` → backend 转发、HTTPS。

---

## 8. 安全现状（已核查）

- 代码库**无密钥泄露**：无硬编码 token/私钥/连接串，`.env` 未提交，全走 env/Secrets。
- 默认管理员密码 `admin123` **线上已改强密码**。
- JWT 生产密钥被 compose 强制覆盖（`:?`），本地用占位密钥。
- 仓库 public 只读：陌生人无写权限→无法 push 触发部署；workflow 不监听 fork PR、fork PR 也拿不到 secrets。
- 唯一建议：GitHub 账号开 **2FA**（防账号被盗，账号失守=可部署恶意代码）。

---

## 9. 已知技术债 / Lint

`npm run lint` 当前约 7 错 7 警（GitHub UI 去重后显示 ~3 错 8 警），**全是代码风格/最佳实践提示，不影响构建与线上运行**。CI 里 lint 设了 `continue-on-error: true` 故不阻塞（注释写明「修完后请删除」）。
- prefer-const、多余 eslint-disable 注解 → `npm run lint -- --fix` 可自动修
- `set-state-in-effect`（React 19 新规则）→ 性能建议，非 bug
- `<img>` 建议换 `next/image` → 优化建议，static 资源保持 `<img>` 亦可
- useEffect 依赖提示 → 静态分析提醒，逻辑正常

---

## 10. 进度与待办

**P1（全部完成）**：后台 4 模块（文章/分类/评论/用户）+ 顶部导航 + 后端加固（统一异常码、@Valid、用户删除保护、密码防泄露、登录统一响应、关闭 OSIV）。

用户删除保护（[UserService](file:///Users/bytedance/liu/isME/backend/src/main/java/com/personalsite/service/UserService.java)）四重：禁止自删 / 自我降级 / 自我停用 / 删除最后一个启用的 ADMIN。

**P2 进度**：
- ✅ #19 图片上传接口、#20 富文本编辑器、#21 图片压缩（mozjpeg 8.8%；WebP 反而更大，放弃）、#5 后端单元测试（13 passed）
- ⏭️ #22 评论系统：跳过（笔记已用 Supabase，决定不动）
- ✅ **#11 鉴权加固：localStorage → HttpOnly Cookie + CSRF**（已完成）。后端：JWT 改写入 HttpOnly Cookie、新增 `/api/auth/logout` 与 `/api/auth/me`、`JwtAuthenticationFilter` 从 Cookie 读 token、`SecurityConfig` 启用 CSRF 双重提交（含免 CSRF 名单与 XSRF cookie 下发 filter）、`CorsConfig` 放行 `X-XSRF-TOKEN`、新增 `app.cookie.secure/same-site` 配置（生产 compose 注入 `COOKIE_SECURE=true`）。前端：`client.ts` 全部请求 `credentials:'include'` + 写请求带 `X-XSRF-TOKEN`、`auth.ts` 移除 token 存取改用 `logout()/getMe()`、登录页/后台守卫/用户管理页相应改造。详见第 4 节「鉴权」。

**P2 全部完成。** 后续若有新需求再排。

**最近提交**：`fc5e136`（P1+产品页）→ `e57f8f0`（P2 #19/#20/#21 + 多个 bug 修复 + 前端清理）→ `8d41084`（P2 #5 单测）。

---

## 11. 协作约定（用户偏好）

- 用户全程使用**中文**。
- **每完成一项任务先本地验证再决定提交**，常多个改动累积后统一 push；**未经用户确认不要擅自 commit/push**。
- 遇问题先**定位根因**再修，不要盲目试。
- 大改动（如 #11）**动手前先给方案**。
- 代码注释用中文。
- 不做超出要求的「优化」；保持改动聚焦最小。
