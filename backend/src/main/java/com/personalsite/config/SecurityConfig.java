package com.personalsite.config;

import com.personalsite.security.JwtAuthenticationFilter;
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
        http
            .csrf(csrf -> csrf.disable())
            // CORS 配置统一由 CorsConfig 提供的 corsConfigurationSource Bean 接管
            .cors(Customizer.withDefaults())
            .authorizeHttpRequests(auth -> auth
                // ---- 公开：认证与文档 ----
                // 仅登录公开；注册不再对匿名开放（关闭公开注册），
                // 创建账户走 anyRequest().hasRole("ADMIN")，即只有管理员能新建用户。
                .requestMatchers("/api/auth/login").permitAll()
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
                    "/api/comments/**", "/api/public/**").permitAll()

                // ---- 公开写：访客行为（浏览计数 / 提交评论）----
                .requestMatchers(HttpMethod.POST, "/api/articles/*/view").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/comments").permitAll()

                // ---- 其余一律需要管理员（默认拒绝原则）----
                // 覆盖：文章/分类的增删改、评论审核与删除、用户管理等全部后台写操作
                .anyRequest().hasRole("ADMIN")
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
