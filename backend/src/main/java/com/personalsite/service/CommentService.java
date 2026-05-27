package com.personalsite.service;

import com.personalsite.dto.CommentDTO;
import com.personalsite.entity.Article;
import com.personalsite.entity.Comment;
import com.personalsite.repository.ArticleRepository;
import com.personalsite.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final ArticleRepository articleRepository;
    
    public List<CommentDTO> getCommentsByArticleId(Long articleId) {
        return commentRepository.findByArticleIdAndIsApprovedTrue(articleId, 
                PageRequest.of(0, 100, Sort.by("createdAt").descending()))
                .getContent().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public CommentDTO getCommentById(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("评论不存在"));
        return toDTO(comment);
    }
    
    public Page<CommentDTO> getPendingComments(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return commentRepository.findByIsApprovedFalse(pageable).map(this::toDTO);
    }
    
    @Transactional
    public CommentDTO createComment(CommentDTO commentDTO) {
        Comment comment = new Comment();
        comment.setContent(commentDTO.getContent());
        comment.setAuthorName(commentDTO.getAuthorName());
        comment.setAuthorEmail(commentDTO.getAuthorEmail());
        comment.setIsApproved(false);
        
        if (commentDTO.getArticleId() != null) {
            Article article = articleRepository.findById(commentDTO.getArticleId())
                    .orElseThrow(() -> new RuntimeException("文章不存在"));
            comment.setArticle(article);
        }
        
        return toDTO(commentRepository.save(comment));
    }
    
    @Transactional
    public CommentDTO approveComment(Long id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("评论不存在"));
        comment.setIsApproved(true);
        return toDTO(commentRepository.save(comment));
    }
    
    @Transactional
    public void deleteComment(Long id) {
        if (!commentRepository.existsById(id)) {
            throw new RuntimeException("评论不存在");
        }
        commentRepository.deleteById(id);
    }
    
    public Long countCommentsByArticleId(Long articleId) {
        return commentRepository.countByArticleIdAndIsApprovedTrue(articleId);
    }
    
    private CommentDTO toDTO(Comment comment) {
        CommentDTO dto = new CommentDTO();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setAuthorName(comment.getAuthorName());
        dto.setAuthorEmail(comment.getAuthorEmail());
        dto.setIsApproved(comment.getIsApproved());
        dto.setCreatedAt(comment.getCreatedAt());
        
        if (comment.getArticle() != null) {
            dto.setArticleId(comment.getArticle().getId());
            dto.setArticleTitle(comment.getArticle().getTitle());
        }
        
        return dto;
    }
}
