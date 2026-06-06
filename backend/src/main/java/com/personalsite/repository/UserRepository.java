package com.personalsite.repository;

import com.personalsite.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Boolean existsByUsername(String username);
    Boolean existsByEmail(String email);

    /**
     * 统计指定角色且处于启用状态的用户数；用于"防止删除/停用/降级最后一个 ADMIN"。
     */
    long countByRoleAndEnabledTrue(String role);
}
