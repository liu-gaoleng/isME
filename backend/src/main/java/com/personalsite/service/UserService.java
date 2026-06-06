package com.personalsite.service;

import com.personalsite.dto.UserDTO;
import com.personalsite.entity.User;
import com.personalsite.exception.BusinessException;
import com.personalsite.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ROLE_ADMIN = "ADMIN";

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
    
    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return toDTO(user);
    }
    
    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        return toDTO(user);
    }
    
    @Transactional
    public UserDTO createUser(UserDTO userDTO) {
        if (userRepository.existsByUsername(userDTO.getUsername())) {
            throw new BusinessException("用户名已存在");
        }
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new BusinessException("邮箱已被使用");
        }
        
        User user = new User();
        user.setUsername(userDTO.getUsername());
        user.setEmail(userDTO.getEmail());
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setNickname(userDTO.getNickname());
        user.setAvatar(userDTO.getAvatar());
        user.setBio(userDTO.getBio());
        user.setRole(userDTO.getRole() != null ? userDTO.getRole() : "USER");
        user.setEnabled(true);
        
        return toDTO(userRepository.save(user));
    }
    
    @Transactional
    public UserDTO updateUser(Long id, UserDTO userDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        
        if (userDTO.getNickname() != null) {
            user.setNickname(userDTO.getNickname());
        }
        if (userDTO.getAvatar() != null) {
            user.setAvatar(userDTO.getAvatar());
        }
        if (userDTO.getBio() != null) {
            user.setBio(userDTO.getBio());
        }
        // 角色变更：如果把当前 ADMIN 降级为非 ADMIN，必须确保系统里还有其它启用中的 ADMIN
        if (userDTO.getRole() != null && !userDTO.getRole().isBlank()) {
            String newRole = userDTO.getRole();
            if (ROLE_ADMIN.equals(user.getRole()) && !ROLE_ADMIN.equals(newRole)
                    && Boolean.TRUE.equals(user.getEnabled())) {
                ensureNotLastEnabledAdmin(user, "降级");
            }
            user.setRole(newRole);
        }
        // 启停变更：如果把当前启用的 ADMIN 停用，必须确保系统里还有其它启用中的 ADMIN
        if (userDTO.getEnabled() != null) {
            if (Boolean.FALSE.equals(userDTO.getEnabled())
                    && ROLE_ADMIN.equals(user.getRole())
                    && Boolean.TRUE.equals(user.getEnabled())) {
                ensureNotLastEnabledAdmin(user, "停用");
            }
            user.setEnabled(userDTO.getEnabled());
        }
        if (userDTO.getPassword() != null && !userDTO.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        }
        
        return toDTO(userRepository.save(user));
    }
    
    @Transactional
    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException("用户不存在"));
        // 1) 不允许删除当前登录账号，避免把自己锁出后台
        String currentEmail = currentUserEmail();
        if (currentEmail != null && currentEmail.equals(user.getEmail())) {
            throw new BusinessException("不允许删除当前登录账号");
        }
        // 2) 如果待删除用户是启用中的 ADMIN，必须确保系统里还有其它启用中的 ADMIN
        if (ROLE_ADMIN.equals(user.getRole()) && Boolean.TRUE.equals(user.getEnabled())) {
            ensureNotLastEnabledAdmin(user, "删除");
        }
        userRepository.deleteById(id);
    }

    /**
     * 校验目标 ADMIN 不是系统里最后一个启用状态的 ADMIN，否则操作会让后台无人可登。
     */
    private void ensureNotLastEnabledAdmin(User target, String action) {
        long enabledAdmins = userRepository.countByRoleAndEnabledTrue(ROLE_ADMIN);
        if (enabledAdmins <= 1) {
            throw new BusinessException("系统至少需要保留一个启用中的管理员，无法" + action + "该账号");
        }
    }

    /**
     * 返回当前登录用户邮箱（在 CustomUserDetailsService 中以 email 作为 username）。
     * 没有登录上下文时返回 null。
     */
    private String currentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        if (principal instanceof UserDetails ud) {
            return ud.getUsername();
        }
        return null;
    }
    
    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setNickname(user.getNickname());
        dto.setAvatar(user.getAvatar());
        dto.setBio(user.getBio());
        dto.setRole(user.getRole());
        dto.setEnabled(user.getEnabled());
        return dto;
    }
}
