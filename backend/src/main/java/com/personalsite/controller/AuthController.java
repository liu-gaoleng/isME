package com.personalsite.controller;

import com.personalsite.dto.ApiResponse;
import com.personalsite.dto.LoginRequest;
import com.personalsite.dto.LoginResponse;
import com.personalsite.dto.RegisterRequest;
import com.personalsite.dto.UserDTO;
import com.personalsite.entity.User;
import com.personalsite.exception.BusinessException;
import com.personalsite.repository.UserRepository;
import com.personalsite.security.JwtAuthenticationFilter;
import com.personalsite.security.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // JWT 过期时间（毫秒），同时作为 Cookie 的 Max-Age 基准
    @Value("${jwt.expiration}")
    private Long expiration;

    // Cookie 安全标志：生产走 HTTPS 须为 true，本地开发为 false
    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    // SameSite 策略，默认 Lax（同域足够，且外链跳转仍保持登录）
    @Value("${app.cookie.same-site:Lax}")
    private String cookieSameSite;

    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request,
                                            HttpServletResponse response) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getEmail());
        final String jwt = jwtUtil.generateToken(userDetails);

        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();

        // 将 JWT 写入 HttpOnly Cookie，前端 JS 无法读取，规避 XSS 窃取凭证。
        response.addHeader(HttpHeaders.SET_COOKIE, buildAccessTokenCookie(jwt).toString());

        return ApiResponse.success(LoginResponse.builder()
            .user(UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .build())
            .build());
    }

    /** 退出登录：下发一个立即过期的同名 Cookie 清除登录态。 */
    @PostMapping("/logout")
    public ApiResponse<Void> logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, buildExpiredCookie().toString());
        return ApiResponse.success(null);
    }

    /**
     * 返回当前登录用户信息，供前端路由守卫与「当前账号」判断使用。
     * 未登录时由 Spring Security 返回 401（不会进入此方法）。
     */
    @GetMapping("/me")
    public ApiResponse<UserDTO> me(@AuthenticationPrincipal UserDetails principal) {
        User user = userRepository.findByEmail(principal.getUsername()).orElseThrow();
        return ApiResponse.success(UserDTO.builder()
            .id(user.getId())
            .username(user.getUsername())
            .email(user.getEmail())
            .nickname(user.getNickname())
            .avatar(user.getAvatar())
            .bio(user.getBio())
            .role(user.getRole())
            .enabled(user.getEnabled())
            .build());
    }

    @PostMapping("/register")
    public ApiResponse<UserDTO> register(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("邮箱已被注册");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BusinessException("用户名已存在");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("USER");
        user.setEnabled(true);
        
        User savedUser = userRepository.save(user);

        return ApiResponse.success(UserDTO.builder()
            .id(savedUser.getId())
            .username(savedUser.getUsername())
            .email(savedUser.getEmail())
            .role(savedUser.getRole())
            .build());
    }

    /** 构造存放 JWT 的 HttpOnly Cookie，Max-Age 与 JWT 有效期一致。 */
    private ResponseCookie buildAccessTokenCookie(String jwt) {
        return ResponseCookie.from(JwtAuthenticationFilter.ACCESS_TOKEN_COOKIE, jwt)
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .path("/")
            // 与 JwtUtil 保持一致：expiration 配置项以「秒」为单位
            .maxAge(Duration.ofSeconds(expiration))
            .build();
    }

    /** 构造立即过期的同名 Cookie，用于退出登录。 */
    private ResponseCookie buildExpiredCookie() {
        return ResponseCookie.from(JwtAuthenticationFilter.ACCESS_TOKEN_COOKIE, "")
            .httpOnly(true)
            .secure(cookieSecure)
            .sameSite(cookieSameSite)
            .path("/")
            .maxAge(0)
            .build();
    }
}
