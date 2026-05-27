# 个人网站项目

## 项目概述

这是一个完整的前后端分离的个人网站项目，包含博客功能、后台管理等功能。

### 技术栈

**前端**
- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4

**后端**
- Spring Boot 3.2.5
- Spring Data JPA
- Spring Security
- MySQL 8.0

## 项目结构

```
justdoit/
├── frontend/                  # Next.js 前端项目（现有）
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx         # 首页
│   │   ├── blog/            # 博客页面
│   │   │   ├── page.tsx     # 博客列表
│   │   │   └── [slug]/     # 文章详情
│   │   ├── about/           # 关于页面
│   │   └── admin/           # 管理后台
│   ├── components/          # React 组件
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── ArticleCard.tsx
│   └── lib/api/             # API 调用层
│       ├── client.ts
│       ├── article.ts
│       ├── category.ts
│       └── comment.ts
│
└── backend/                  # Spring Boot 后端项目（新建）
    ├── src/main/java/com/personalsite/
    │   ├── config/          # 配置类
    │   ├── controller/       # REST API
    │   ├── dto/             # 数据传输对象
    │   ├── entity/          # JPA 实体
    │   ├── exception/       # 异常处理
    │   ├── repository/     # 数据访问层
    │   └── service/         # 业务逻辑层
    └── pom.xml
```

## 快速开始

### 1. 启动后端

```bash
cd backend

# 配置数据库
# 1. 修改 src/main/resources/application.yml 中的数据库配置
# 2. 创建数据库: CREATE DATABASE personal_site CHARACTER SET utf8mb4;

# 启动后端
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 2. 启动前端

```bash
# 安装依赖（如需要）
npm install

# 启动前端
npm run dev
```

前端将在 http://localhost:3000 启动

### 3. 数据库配置

1. 创建 MySQL 数据库：
```sql
CREATE DATABASE personal_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 修改 `backend/src/main/resources/application.yml`：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/personal_site?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai&useSSL=false
    username: root
    password: your_password
```

3. JPA 会自动创建表结构（`ddl-auto: update`）

## 功能模块

### 前端页面
- **首页**：展示精选文章和热门文章
- **博客列表**：分页展示所有文章
- **文章详情**：显示完整文章内容和评论
- **关于页面**：博主介绍和联系方式
- **管理后台**：预留的后台管理入口

### 后端 API
- 文章管理（CRUD）
- 分类管理（CRUD）
- 标签管理
- 评论系统
- 用户认证

## 数据库表

- `users` - 用户表
- `articles` - 文章表
- `categories` - 分类表
- `tags` - 标签表
- `comments` - 评论表

## 环境变量

前端 `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

后端 `application.yml`:
```yaml
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/personal_site
    username: root
    password: your_password
```

## 注意事项

1. **CORS**：后端已配置允许所有来源（开发环境），生产环境请修改
2. **安全配置**：当前 Security 配置为允许所有请求，生产环境需要添加 JWT 验证
3. **数据库**：JPA 的 `ddl-auto` 设置为 `update`，会自动创建和更新表结构
4. **默认账户**：需要手动在数据库中创建管理员账户

## 下一步

1. 实现用户认证（JWT）
2. 完成后台管理界面
3. 添加富文本编辑器
4. 实现文件上传功能
5. 部署到生产环境
