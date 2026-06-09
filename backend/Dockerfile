FROM maven:3.9.6-eclipse-temurin-17 AS builder

WORKDIR /app

# 配置阿里云 Maven 镜像源，加速国内服务器依赖下载
COPY backend/maven-settings.xml /root/.m2/settings.xml

# 注意：构建上下文是项目根目录（见 docker-compose.yml 中 context: .），
# 因此这里需要带上 backend/ 前缀才能定位到正确的源码路径
COPY backend/pom.xml .

COPY backend/src ./src
# 直接 package（依赖按需下载）。不使用 dependency:go-offline，
# 因为它会解析全部传递依赖（含 flyway 拖出的 google-cloud-storage alpha 包），
# 而该包在镜像源上常缺失/502，且项目实际用不到，会导致构建失败。
RUN mvn package -DskipTests -B

FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

COPY --from=builder /app/target/backend-1.0.0.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
