package com.personalsite.repository;

import com.personalsite.entity.QuestionAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuestionAnswerRepository extends JpaRepository<QuestionAnswer, Long> {
    Optional<QuestionAnswer> findByAnsweredOn(LocalDate answeredOn);

    List<QuestionAnswer> findAllByOrderByAnsweredOnDesc();
}
