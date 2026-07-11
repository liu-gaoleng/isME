package com.personalsite.controller;

import com.personalsite.dto.ApiResponse;
import com.personalsite.dto.HappyMomentDTO;
import com.personalsite.service.HappyMomentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 小确幸接口。GET 公开，写操作仅 ADMIN。
 */
@RestController
@RequestMapping("/api/happy-moments")
@RequiredArgsConstructor
public class HappyMomentController {
    private final HappyMomentService happyMomentService;

    @GetMapping
    public ApiResponse<List<HappyMomentDTO>> list() {
        return ApiResponse.success(happyMomentService.getAll());
    }

    @PostMapping
    public ApiResponse<HappyMomentDTO> create(@Valid @RequestBody HappyMomentDTO dto) {
        return ApiResponse.success("已记录", happyMomentService.create(dto));
    }

    @PutMapping("/{id}")
    public ApiResponse<HappyMomentDTO> update(@PathVariable Long id, @RequestBody HappyMomentDTO dto) {
        return ApiResponse.success("已更新", happyMomentService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        happyMomentService.delete(id);
        return ApiResponse.success("已删除", null);
    }
}
