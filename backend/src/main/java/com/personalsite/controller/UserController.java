package com.personalsite.controller;

import com.personalsite.dto.ApiResponse;
import com.personalsite.dto.UserDTO;
import com.personalsite.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    
    @GetMapping
    public ApiResponse<List<UserDTO>> getAllUsers() {
        return ApiResponse.success(userService.getAllUsers());
    }
    
    @GetMapping("/{id}")
    public ApiResponse<UserDTO> getUserById(@PathVariable Long id) {
        return ApiResponse.success(userService.getUserById(id));
    }
    
    @GetMapping("/username/{username}")
    public ApiResponse<UserDTO> getUserByUsername(@PathVariable String username) {
        return ApiResponse.success(userService.getUserByUsername(username));
    }
    
    @PostMapping
    public ApiResponse<UserDTO> createUser(@Valid @RequestBody UserDTO userDTO) {
        return ApiResponse.success("用户创建成功", userService.createUser(userDTO));
    }

    /**
     * 部分更新：前端只会传需要修改的字段（如 {role:"ADMIN"} 或 {enabled:false}），
     * 此处不加 @Valid，避免对 username/email/password 等"非本次修改字段"的 @NotBlank 误触发；
     * 字段级别的合法性已在 UserService.updateUser 中分支校验。
     */
    @PutMapping("/{id}")
    public ApiResponse<UserDTO> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
        return ApiResponse.success("用户更新成功", userService.updateUser(id, userDTO));
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ApiResponse.success("用户删除成功", null);
    }
}
