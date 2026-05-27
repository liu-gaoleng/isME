# 前端构建阶段
FROM node:20-alpine AS frontend-build

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# 后端构建阶段
FROM maven:3.9.6-eclipse-temurin-17 AS backend-build

WORKDIR /app

COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

COPY backend/src ./src
RUN mvn package -DskipTests

# 最终运行阶段
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=backend-build /app/target/backend-1.0.0.jar app.jar
COPY --from=frontend-build /app/.next /app/frontend

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
