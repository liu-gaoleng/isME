# 个人网站后端

## 技术栈
- Java 17
- Spring Boot 3.2.5
- Spring Data JPA
- MySQL 8.0
- Spring Security
- JWT
- Lombok

## 项目结构
```
backend/
├── src/main/java/com/personalsite/
│   ├── PersonalSiteApplication.java
│   ├── config/          # 配置类
│   ├── controller/      # REST API 控制器
│   ├── dto/             # 数据传输对象
│   ├── entity/          # JPA 实体类
│   ├── exception/       # 异常处理
│   ├── repository/       # 数据访问层
│   └── service/         # 业务逻辑层
├── src/main/resources/
│   ├── application.yml  # 应用配置
│   └── schema.sql       # 数据库初始化脚本
└── pom.xml             # Maven 配置
```

## 快速开始

### 1. 环境要求
- JDK 17+
- Maven 3.6+
- MySQL 8.0+

### 2. 数据库配置
1. 创建数据库：
```sql
CREATE DATABASE personal_site CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 修改 `application.yml` 中的数据库配置：
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/personal_site
    username: your_username
    password: your_password
```

### 3. 启动项目
```bash
cd backend
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

## API 接口

### 文章接口
- `GET /api/articles` - 获取已发布的文章列表
- `GET /api/articles/{id}` - 获取文章详情
- `GET /api/articles/slug/{slug}` - 通过 slug 获取文章
- `GET /api/articles/featured` - 获取精选文章
- `GET /api/articles/popular` - 获取热门文章
- `GET /api/articles/category/{categoryId}` - 按分类获取文章

### 分类接口
- `GET /api/categories` - 获取所有分类
- `GET /api/categories/{id}` - 获取分类详情

### 评论接口
- `GET /api/comments/article/{articleId}` - 获取文章的评论
- `POST /api/comments` - 提交评论

### 公开信息
- `GET /api/public/about` - 获取博主信息

## 数据库表结构

### users 表
- 用户/管理员账户

### articles 表
- 博客文章

### categories 表
- 文章分类

### tags 表
- 文章标签

### comments 表
- 文章评论

## 开发说明

JPA 配置为自动更新模式 (`ddl-auto: update`)，启动时会自动创建表结构。

如需手动初始化数据，请执行 `schema.sql` 脚本。
