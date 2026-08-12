package com.personalsite.repository;

import com.personalsite.entity.SiteStat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface SiteStatRepository extends JpaRepository<SiteStat, Long> {

    /** 原子自增 PV，避免「读-改-写」在高并发下丢计数。 */
    @Modifying
    @Query("UPDATE SiteStat s SET s.totalVisits = s.totalVisits + 1 WHERE s.id = 1")
    int incrementVisits();
}
