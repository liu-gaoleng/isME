FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# 注意：构建上下文是项目根目录（见 docker-compose.yml 中 context: .），
# 因此这里需要带上 backend/ 前缀才能定位到正确的源码路径
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

COPY backend/src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
