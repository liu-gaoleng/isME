package com.personalsite.repository;

import com.personalsite.entity.ThinkAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ThinkAnswerRepository extends JpaRepository<ThinkAnswer, Long> {
    Optional<ThinkAnswer> findByQuestionId(Long questionId);
}
