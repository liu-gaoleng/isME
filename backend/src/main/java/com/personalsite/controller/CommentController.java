package com.personalsite.controller;

import com.personalsite.dto.ApiResponse;
import com.personalsite.dto.CommentDTO;
import com.personalsite.service.CommentService;
import jakarta.validation.Valid;
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

    /**
     * 后台评论列表，按审核状态筛选；status 取值 pending/approved/all。
     * 该路径未在 SecurityConfig 中放行，自动落入 anyRequest().hasRole("ADMIN")。
     */
    @GetMapping("/admin")
    public ApiResponse<Page<CommentDTO>> getCommentsForAdmin(
            @RequestParam(defaultValue = "all") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Boolean isApproved = switch (status) {
            case "pending" -> Boolean.FALSE;
            case "approved" -> Boolean.TRUE;
            default -> null;
        };
        return ApiResponse.success(commentService.getCommentsByStatus(isApproved, page, size));
    }
    
    @PostMapping
    public ApiResponse<CommentDTO> createComment(@Valid @RequestBody CommentDTO commentDTO) {
        return ApiResponse.success("评论提交成功", commentService.createComment(commentDTO));
    }
    
    @PutMapping("/{id}/approve")
    public ApiResponse<CommentDTO> approveComment(@PathVariable Long id) {
        return ApiResponse.success("评论审核通过", commentService.approveComment(id));
    }

    @PutMapping("/{id}/reject")
    public ApiResponse<CommentDTO> rejectComment(@PathVariable Long id) {
        return ApiResponse.success("已撤销审核", commentService.rejectComment(id));
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
