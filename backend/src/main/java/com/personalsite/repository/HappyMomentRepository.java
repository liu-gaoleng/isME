package com.personalsite.repository;

import com.personalsite.entity.HappyMoment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HappyMomentRepository extends JpaRepository<HappyMoment, Long> {
    // 先按发生日期倒序，同一天内按创建时间倒序
    List<HappyMoment> findAllByOrderByHappenedOnDescCreatedAtDesc();
}
