package com.personalsite.repository;

import com.personalsite.entity.ThinkQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ThinkQuestionRepository extends JpaRepository<ThinkQuestion, Long> {
    Optional<ThinkQuestion> findByPeriodIndex(Integer periodIndex);

    List<ThinkQuestion> findAllByOrderByPeriodIndexDesc();
}
