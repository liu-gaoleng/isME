package com.personalsite.config;

import com.personalsite.entity.User;
import com.personalsite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * 启动时确保存在一个管理员账户。
 * 凭据全部通过环境变量注入，不在代码/迁移脚本里写死真实口令：
 *   ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD
 * 本地无环境变量时使用下方开发占位值，生产环境必须覆盖。
 * 仅当库中尚不存在该邮箱时才创建；已存在则跳过（不会覆盖你改过的密码）。
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username:admin}")
    private String adminUsername;

    @Value("${app.admin.email:admin@example.com}")
    private String adminEmail;

    @Value("${app.admin.password:admin123}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        if (userRepository.existsByEmail(adminEmail)) {
            log.info("管理员账户已存在（{}），跳过初始化。", adminEmail);
            return;
        }

        User admin = new User();
        admin.setUsername(adminUsername);
        admin.setEmail(adminEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setNickname("博主");
        admin.setBio("个人网站管理员");
        admin.setRole("ADMIN");
        admin.setEnabled(true);
        userRepository.save(admin);

        log.warn("已创建初始管理员账户：email={} （请尽快登录后修改默认密码！）", adminEmail);
    }
}
