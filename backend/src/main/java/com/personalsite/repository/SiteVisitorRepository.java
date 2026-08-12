package com.personalsite.repository;

import com.personalsite.entity.SiteVisitor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SiteVisitorRepository extends JpaRepository<SiteVisitor, Long> {

    Optional<SiteVisitor> findByVisitorId(String visitorId);
}
