package com.personalsite.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    
    private Long id;

    @NotBlank(message = "用户名不能为空")
    @Size(min = 3, max = 50, message = "用户名长度需在 3~50 字符之间")
    private String username;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    /**
     * 密码字段：只允许从前端 POST/PUT 反序列化进来；
     * 永远不出现在响应 JSON 中，避免哪怕是 null 也作为信息暴露面。
     * 注意：这里不加 @NotBlank，因为 PUT 更新（改昵称、改角色等）时允许不传 password；
     * createUser 中再单独校验 password 不为空。
     */
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Size(min = 6, max = 100, message = "密码长度需在 6~100 字符之间")
    private String password;

    @Size(max = 50, message = "昵称长度不能超过 50 个字符")
    private String nickname;
    
    private String avatar;
    
    private String bio;
    
    private String role;
    
    private Boolean enabled;
}
