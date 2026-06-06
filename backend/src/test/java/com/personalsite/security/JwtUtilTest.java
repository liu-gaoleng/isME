package com.personalsite.security;

import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Collections;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    private UserDetails user(String username) {
        return new User(username, "pwd", Collections.emptyList());
    }

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        // 至少 32 字节，满足 HMAC-SHA256 密钥长度要求
        ReflectionTestUtils.setField(jwtUtil, "secret",
                "test-secret-key-must-be-at-least-32-bytes-long-123456");
        ReflectionTestUtils.setField(jwtUtil, "expiration", 3600L);
    }

    @Test
    void generateAndExtractUsername_shouldRoundTrip() {
        String token = jwtUtil.generateToken(user("alice@site.com"));

        assertThat(token).isNotBlank();
        assertThat(jwtUtil.extractUsername(token)).isEqualTo("alice@site.com");
    }

    @Test
    void validateToken_shouldReturnTrueForMatchingUser() {
        UserDetails alice = user("alice@site.com");
        String token = jwtUtil.generateToken(alice);

        assertThat(jwtUtil.validateToken(token, alice)).isTrue();
    }

    @Test
    void validateToken_shouldReturnFalseForDifferentUser() {
        String token = jwtUtil.generateToken(user("alice@site.com"));

        assertThat(jwtUtil.validateToken(token, user("bob@site.com"))).isFalse();
    }

    @Test
    void extractExpiration_shouldBeInTheFuture() {
        String token = jwtUtil.generateToken(user("alice@site.com"));

        assertThat(jwtUtil.extractExpiration(token)).isInTheFuture();
    }

    @Test
    void expiredToken_shouldThrowOnParse() {
        // 过期时间设为负数：签发即过期
        ReflectionTestUtils.setField(jwtUtil, "expiration", -10L);
        String token = jwtUtil.generateToken(user("alice@site.com"));

        assertThatThrownBy(() -> jwtUtil.extractUsername(token))
                .isInstanceOf(ExpiredJwtException.class);
    }
}
