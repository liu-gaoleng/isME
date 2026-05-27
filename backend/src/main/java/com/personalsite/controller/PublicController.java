package com.personalsite.controller;

import com.personalsite.dto.ApiResponse;
import com.personalsite.entity.User;
import com.personalsite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class PublicController {
    private final UserRepository userRepository;
    
    @GetMapping("/public/about")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAbout() {
        // 获取第一个管理员用户作为博主信息
        User admin = userRepository.findAll().stream()
                .filter(u -> "ADMIN".equals(u.getRole()))
                .findFirst()
                .orElse(null);
        
        Map<String, Object> about = new HashMap<>();
        if (admin != null) {
            about.put("name", admin.getNickname() != null ? admin.getNickname() : admin.getUsername());
            about.put("bio", admin.getBio());
            about.put("avatar", admin.getAvatar());
        }
        
        return ResponseEntity.ok(ApiResponse.success(about));
    }
}
