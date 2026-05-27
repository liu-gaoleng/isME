package com.personalsite.repository;

import com.personalsite.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    Optional<Article> findBySlug(String slug);
    
    Page<Article> findByIsPublishedTrue(Pageable pageable);
    
    Page<Article> findByCategoryIdAndIsPublishedTrue(Long categoryId, Pageable pageable);
    
    @Query("SELECT a FROM Article a WHERE a.isPublished = true AND a.isFeatured = true")
    List<Article> findFeaturedArticles();
    
    @Query("SELECT a FROM Article a WHERE a.isPublished = true ORDER BY a.viewCount DESC")
    List<Article> findPopularArticles(Pageable pageable);
    
    Boolean existsBySlug(String slug);
}
