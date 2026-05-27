package com.personalsite.controller;

import com.personalsite.dto.ApiResponse;
import com.personalsite.dto.ArticleDTO;
import com.personalsite.service.ArticleService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/articles")
@RequiredArgsConstructor
public class ArticleController {
    private final ArticleService articleService;
    
    @GetMapping
    public ApiResponse<Page<ArticleDTO>> getPublishedArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(articleService.getPublishedArticles(page, size));
    }
    
    @GetMapping("/{id}")
    public ApiResponse<ArticleDTO> getArticleById(@PathVariable Long id) {
        return ApiResponse.success(articleService.getArticleById(id));
    }
    
    @GetMapping("/slug/{slug}")
    public ApiResponse<ArticleDTO> getArticleBySlug(@PathVariable String slug) {
        return ApiResponse.success(articleService.getArticleBySlug(slug));
    }
    
    @GetMapping("/category/{categoryId}")
    public ApiResponse<Page<ArticleDTO>> getArticlesByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.success(articleService.getArticlesByCategory(categoryId, page, size));
    }
    
    @GetMapping("/featured")
    public ApiResponse<List<ArticleDTO>> getFeaturedArticles() {
        return ApiResponse.success(articleService.getFeaturedArticles());
    }
    
    @GetMapping("/popular")
    public ApiResponse<List<ArticleDTO>> getPopularArticles(
            @RequestParam(defaultValue = "5") int limit) {
        return ApiResponse.success(articleService.getPopularArticles(limit));
    }
    
    @GetMapping("/admin/all")
    public ApiResponse<List<ArticleDTO>> getAllArticles() {
        return ApiResponse.success(articleService.getAllArticles());
    }
    
    @PostMapping
    public ApiResponse<ArticleDTO> createArticle(@RequestBody ArticleDTO articleDTO) {
        return ApiResponse.success("文章创建成功", articleService.createArticle(articleDTO));
    }
    
    @PutMapping("/{id}")
    public ApiResponse<ArticleDTO> updateArticle(@PathVariable Long id, @RequestBody ArticleDTO articleDTO) {
        return ApiResponse.success("文章更新成功", articleService.updateArticle(id, articleDTO));
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteArticle(@PathVariable Long id) {
        articleService.deleteArticle(id);
        return ApiResponse.success("文章删除成功", null);
    }
    
    @PostMapping("/{id}/view")
    public ApiResponse<Void> incrementViewCount(@PathVariable Long id) {
        articleService.incrementViewCount(id);
        return ApiResponse.success("浏览量更新成功", null);
    }
}
