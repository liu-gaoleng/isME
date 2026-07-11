package com.personalsite.controller;

import com.personalsite.dto.ApiResponse;
import com.personalsite.dto.BoardDTO;
import com.personalsite.service.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * 画板接口。GET 公开（SecurityConfig 放行），写操作由兜底规则限制为 ADMIN。
 */
@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {
    private final BoardService boardService;

    @GetMapping
    public ApiResponse<List<BoardDTO>> list() {
        return ApiResponse.success(boardService.getAllBoards());
    }

    @GetMapping("/{id}")
    public ApiResponse<BoardDTO> get(@PathVariable Long id) {
        return ApiResponse.success(boardService.getBoardById(id));
    }

    @PostMapping
    public ApiResponse<BoardDTO> create(@RequestBody BoardDTO dto) {
        return ApiResponse.success("画板创建成功", boardService.createBoard(dto));
    }

    @PutMapping("/{id}")
    public ApiResponse<BoardDTO> update(@PathVariable Long id, @RequestBody BoardDTO dto) {
        return ApiResponse.success("画板已保存", boardService.updateBoard(id, dto));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id) {
        boardService.deleteBoard(id);
        return ApiResponse.success("画板已删除", null);
    }
}
