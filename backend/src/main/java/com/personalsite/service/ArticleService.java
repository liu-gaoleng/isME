package com.personalsite.service;

import com.personalsite.dto.ArticleDTO;
import com.personalsite.entity.Article;
import com.personalsite.entity.Category;
import com.personalsite.entity.Tag;
import com.personalsite.entity.User;
import com.personalsite.repository.ArticleRepository;
import com.personalsite.repository.CategoryRepository;
import com.personalsite.repository.TagRepository;
import com.personalsite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArticleService {
    private final ArticleRepository articleRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final UserRepository userRepository;
    
    public List<ArticleDTO> getAllArticles() {
        return articleRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public ArticleDTO getArticleById(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文章不存在"));
        return toDTO(article);
    }
    
    public ArticleDTO getArticleBySlug(String slug) {
        Article article = articleRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("文章不存在"));
        return toDTO(article);
    }
    
    public Page<ArticleDTO> getPublishedArticles(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return articleRepository.findByIsPublishedTrue(pageable).map(this::toDTO);
    }
    
    public Page<ArticleDTO> getArticlesByCategory(Long categoryId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return articleRepository.findByCategoryIdAndIsPublishedTrue(categoryId, pageable).map(this::toDTO);
    }
    
    public List<ArticleDTO> getFeaturedArticles() {
        return articleRepository.findFeaturedArticles().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public List<ArticleDTO> getPopularArticles(int limit) {
        return articleRepository.findPopularArticles(PageRequest.of(0, limit)).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ArticleDTO createArticle(ArticleDTO articleDTO) {
        Article article = new Article();
        return saveArticle(article, articleDTO);
    }
    
    @Transactional
    public ArticleDTO updateArticle(Long id, ArticleDTO articleDTO) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文章不存在"));
        return saveArticle(article, articleDTO);
    }
    
    @Transactional
    public void deleteArticle(Long id) {
        if (!articleRepository.existsById(id)) {
            throw new RuntimeException("文章不存在");
        }
        articleRepository.deleteById(id);
    }
    
    @Transactional
    public void incrementViewCount(Long id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("文章不存在"));
        article.setViewCount(article.getViewCount() + 1);
        articleRepository.save(article);
    }
    
    private ArticleDTO saveArticle(Article article, ArticleDTO dto) {
        article.setTitle(dto.getTitle());
        article.setSlug(dto.getSlug());
        article.setContent(dto.getContent());
        article.setSummary(dto.getSummary());
        article.setCoverImage(dto.getCoverImage());
        article.setIsPublished(dto.getIsPublished() != null ? dto.getIsPublished() : false);
        article.setIsFeatured(dto.getIsFeatured() != null ? dto.getIsFeatured() : false);
        
        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("分类不存在"));
            article.setCategory(category);
        }
        
        if (dto.getAuthorId() != null) {
            User author = userRepository.findById(dto.getAuthorId())
                    .orElseThrow(() -> new RuntimeException("作者不存在"));
            article.setAuthor(author);
        }
        
        if (dto.getIsPublished() != null && dto.getIsPublished() && article.getPublishedAt() == null) {
            article.setPublishedAt(LocalDateTime.now());
        }
        
        if (dto.getTagNames() != null && !dto.getTagNames().isEmpty()) {
            Set<Tag> tags = new HashSet<>();
            for (String tagName : dto.getTagNames()) {
                Tag tag = tagRepository.findByName(tagName)
                        .orElseGet(() -> {
                            Tag newTag = new Tag();
                            newTag.setName(tagName);
                            newTag.setSlug(tagName.toLowerCase().replace(" ", "-"));
                            return tagRepository.save(newTag);
                        });
                tags.add(tag);
            }
            article.setTags(tags);
        }
        
        return toDTO(articleRepository.save(article));
    }
    
    private ArticleDTO toDTO(Article article) {
        ArticleDTO dto = new ArticleDTO();
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setSlug(article.getSlug());
        dto.setContent(article.getContent());
        dto.setSummary(article.getSummary());
        dto.setCoverImage(article.getCoverImage());
        dto.setViewCount(article.getViewCount());
        dto.setIsPublished(article.getIsPublished());
        dto.setIsFeatured(article.getIsFeatured());
        dto.setPublishedAt(article.getPublishedAt());
        dto.setCreatedAt(article.getCreatedAt());
        dto.setUpdatedAt(article.getUpdatedAt());
        
        if (article.getCategory() != null) {
            dto.setCategoryId(article.getCategory().getId());
            dto.setCategoryName(article.getCategory().getName());
        }
        
        if (article.getAuthor() != null) {
            dto.setAuthorId(article.getAuthor().getId());
            dto.setAuthorName(article.getAuthor().getNickname());
        }
        
        if (article.getTags() != null && !article.getTags().isEmpty()) {
            dto.setTagNames(article.getTags().stream()
                    .map(Tag::getName)
                    .collect(Collectors.toSet()));
        }
        
        return dto;
    }
}
