package com.personalsite.controller;

import com.personalsite.dto.ApiResponse;
import com.personalsite.dto.CategoryDTO;
import com.personalsite.service.CategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;
    
    @GetMapping
    public ApiResponse<List<CategoryDTO>> getAllCategories() {
        return ApiResponse.success(categoryService.getAllCategories());
    }
    
    @GetMapping("/{id}")
    public ApiResponse<CategoryDTO> getCategoryById(@PathVariable Long id) {
        return ApiResponse.success(categoryService.getCategoryById(id));
    }
    
    @GetMapping("/slug/{slug}")
    public ApiResponse<CategoryDTO> getCategoryBySlug(@PathVariable String slug) {
        return ApiResponse.success(categoryService.getCategoryBySlug(slug));
    }
    
    @PostMapping
    public ApiResponse<CategoryDTO> createCategory(@Valid @RequestBody CategoryDTO categoryDTO) {
        return ApiResponse.success("分类创建成功", categoryService.createCategory(categoryDTO));
    }
    
    @PutMapping("/{id}")
    public ApiResponse<CategoryDTO> updateCategory(@PathVariable Long id, @Valid @RequestBody CategoryDTO categoryDTO) {
        return ApiResponse.success("分类更新成功", categoryService.updateCategory(id, categoryDTO));
    }
    
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ApiResponse.success("分类删除成功", null);
    }
}
