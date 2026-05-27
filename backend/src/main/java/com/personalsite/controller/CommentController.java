package com.personalsite.controller;

import com.personalsite.dto.ApiResponse;
import com.personalsite.dto.CommentDTO;
import com.personalsite.service.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;
    
    @GetMapping("/article/{articleId}")
    public ApiResponse<List<CommentDTO>> getCommentsByArticleId(@PathVariable Long articleId) {
        return ApiResponse.success(commentService.getCommentsByArticleId(articleId));
    }
    
    @GetMapping("/{id}")
    public ApiResponse<CommentDTO> getCommentById(@PathVariable Long id) {
        return ApiResponse.success(commentService.getCommentById(id));
    }
    
    @GetMapping("/pending")
    public ApiResponse<Page<CommentDTO>> getPendingComments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(commentService.getPendingComments(page, size));
    }
    
    @PostMapping
    public ApiResponse<CommentDTO> createComment(@RequestBody CommentDTO commentDTO) {
        return ApiResponse.success("评论提交成功", commentService.createComment(commentDTO));
    }
    
    @PutMapping("/{id}/approve")
    public ApiResponse<CommentDTO> approveComment(@PathVariable Long id) {
        return ApiResponse.success("评论审核通过", commentService.approveComment(id));
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ApiResponse.success("评论删除成功", null);
    }
    
    @GetMapping("/article/{articleId}/count")
    public ApiResponse<Long> countComments(@PathVariable Long articleId) {
        return ApiResponse.success(commentService.countCommentsByArticleId(articleId));
    }
}
