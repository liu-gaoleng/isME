package com.personalsite.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    // JWT 不再返回给前端 JS，改为通过 HttpOnly Cookie 下发（见 AuthController.login）。
    // 这里仅返回当前登录用户的非敏感信息，供前端展示用。
    private UserDTO user;
}
