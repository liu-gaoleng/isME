package com.personalsite.config;

import com.personalsite.security.JwtAuthenticationFilter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        // CSRF：JWT 现存于 Cookie，会被浏览器自动携带，因此必须开启 CSRF 防护。
        // 采用双重提交 Cookie 模式：服务端下发非 HttpOnly 的 XSRF-TOKEN，前端读取后
        // 在写请求头 X-XSRF-TOKEN 中回传，由 Spring 校验两者一致。
        CookieCsrfTokenRepository csrfTokenRepository = CookieCsrfTokenRepository.withHttpOnlyFalse();
        // 关闭 BREACH 防护下的 token 编码，避免 Spring Security 6 中 SPA 取到的
        // 原始 token 与服务端解码后比对不一致（前端直接回传 cookie 原值）。
        CsrfTokenRequestAttributeHandler csrfRequestHandler = new CsrfTokenRequestAttributeHandler();
        csrfRequestHandler.setCsrfRequestAttributeName(null);

        http
            .csrf(csrf -> csrf
                .csrfTokenRepository(csrfTokenRepository)
                .csrfTokenRequestHandler(csrfRequestHandler)
                // 以下接口免 CSRF：登录/登出（登录态变更入口）、访客浏览计数与匿名评论、访问统计上报
                .ignoringRequestMatchers(
                    "/api/auth/login",
                    "/api/auth/logout",
                    "/api/comments",
                    "/api/articles/*/view",
                    "/api/stats/visit"
                )
            )
            // CORS 配置统一由 CorsConfig 提供的 corsConfigurationSource Bean 接管
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                // ---- 公开：认证与文档 ----
                // 仅登录/登出公开；注册不再对匿名开放（关闭公开注册），
                // 创建账户走 anyRequest().hasRole("ADMIN")，即只有管理员能新建用户。
                .requestMatchers("/api/auth/login", "/api/auth/logout").permitAll()
                // 当前登录用户信息：任何已登录用户均可查询自己（前端守卫再校验 ADMIN 角色）
                .requestMatchers("/api/auth/me").authenticated()
                .requestMatchers("/swagger-ui/**", "/api-docs/**", "/v3/api-docs/**").permitAll()
                // 已上传图片公开只读（上传动作 POST /api/upload/** 仍走 anyRequest().hasRole("ADMIN")）
                .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                // ---- 仅管理员：必须声明在下方 GET 通配规则之前，否则会被放行 ----
                .requestMatchers(HttpMethod.GET, "/api/articles/admin/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/comments/pending").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/comments/admin/**").hasRole("ADMIN")

                // ---- 公开只读：博客内容 ----
                .requestMatchers(HttpMethod.GET,
                    "/api/articles/**", "/api/categories/**",
                    "/api/comments/**", "/api/public/**", "/api/stats").permitAll()

                // ---- 公开只读：「me」个人模块（画板 / 小确幸 / 每日一问 / 思考一下）----
                // 仅 GET 公开展示；新增/修改/删除仍走下方 anyRequest().hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET,
                    "/api/boards/**", "/api/happy-moments/**",
                    "/api/daily-question/**", "/api/think/**").permitAll()

                // ---- 公开写：访客行为（浏览计数 / 提交评论 / 访问统计上报）----
                .requestMatchers(HttpMethod.POST, "/api/articles/*/view").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/comments").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/stats/visit").permitAll()

                // ---- 其余一律需要管理员（默认拒绝原则）----
                // 覆盖：文章/分类的增删改、评论审核与删除、用户管理等全部后台写操作
                .anyRequest().hasRole("ADMIN")
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            // 统一鉴权异常输出：未认证返回 401，已认证但权限不足返回 403，
            // 均以 ApiResponse JSON 返回，供前端 client.ts 按 code 统一处理（含 401 自动跳登录）。
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) ->
                    writeApiError(response, HttpServletResponse.SC_UNAUTHORIZED, "未登录或登录已失效"))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                    writeApiError(response, HttpServletResponse.SC_FORBIDDEN, "无权限访问"))
            )
            // 先于鉴权过滤器从 Cookie 解析 JWT 建立认证上下文
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            // 再确保每次响应都下发 XSRF-TOKEN cookie，供前端 SPA 读取
            .addFilterAfter(csrfCookieFilter(), org.springframework.security.web.csrf.CsrfFilter.class);

        return http.build();
    }

    /** 以统一的 ApiResponse JSON 格式输出鉴权错误。 */
    private void writeApiError(HttpServletResponse response, int status, String message) throws IOException {
        response.setStatus(status);
        response.setContentType("application/json;charset=UTF-8");
        String body = String.format(
            "{\"code\":%d,\"message\":\"%s\",\"data\":null,\"timestamp\":%d}",
            status, message, System.currentTimeMillis());
        response.getWriter().write(body);
    }

    /**
     * 触发 CsrfToken 的延迟加载，使 CookieCsrfTokenRepository 在响应中实际写出
     * XSRF-TOKEN cookie。无此过滤器时，首个安全请求前前端可能拿不到 token。
     */
    private OncePerRequestFilter csrfCookieFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                            FilterChain filterChain) throws ServletException, IOException {
                CsrfToken csrfToken = (CsrfToken) request.getAttribute(CsrfToken.class.getName());
                if (csrfToken != null) {
                    // 调用 getToken() 触发 token 生成与 cookie 下发
                    csrfToken.getToken();
                }
                filterChain.doFilter(request, response);
            }
        };
    }
}
