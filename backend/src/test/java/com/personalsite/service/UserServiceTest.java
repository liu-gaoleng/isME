package com.personalsite.service;

import com.personalsite.dto.UserDTO;
import com.personalsite.entity.User;
import com.personalsite.exception.BusinessException;
import com.personalsite.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    private User admin(Long id, String email, boolean enabled) {
        User u = new User();
        u.setId(id);
        u.setEmail(email);
        u.setUsername("admin" + id);
        u.setRole("ADMIN");
        u.setEnabled(enabled);
        return u;
    }

    // 模拟当前登录用户邮箱，写进 SecurityContext
    private void loginAs(String email) {
        UserDetails principal = mock(UserDetails.class);
        when(principal.getUsername()).thenReturn(email);
        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn(principal);
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    void deleteUser_shouldRejectDeletingCurrentLoggedInAccount() {
        User self = admin(1L, "me@site.com", true);
        when(userRepository.findById(1L)).thenReturn(Optional.of(self));
        loginAs("me@site.com");

        assertThatThrownBy(() -> userService.deleteUser(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("当前登录账号");
        verify(userRepository, never()).deleteById(any());
    }

    @Test
    void deleteUser_shouldRejectDeletingLastEnabledAdmin() {
        User target = admin(2L, "admin@site.com", true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.countByRoleAndEnabledTrue("ADMIN")).thenReturn(1L);
        loginAs("other@site.com");

        assertThatThrownBy(() -> userService.deleteUser(2L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("至少需要保留一个");
        verify(userRepository, never()).deleteById(any());
    }

    @Test
    void deleteUser_shouldSucceedWhenAnotherEnabledAdminExists() {
        User target = admin(2L, "admin@site.com", true);
        when(userRepository.findById(2L)).thenReturn(Optional.of(target));
        when(userRepository.countByRoleAndEnabledTrue("ADMIN")).thenReturn(2L);
        loginAs("other@site.com");

        userService.deleteUser(2L);

        verify(userRepository).deleteById(2L);
    }

    @Test
    void deleteUser_shouldThrowWhenUserNotFound() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.deleteUser(99L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("用户不存在");
    }

    @Test
    void updateUser_shouldRejectDemotingLastEnabledAdmin() {
        User target = admin(3L, "admin@site.com", true);
        when(userRepository.findById(3L)).thenReturn(Optional.of(target));
        when(userRepository.countByRoleAndEnabledTrue("ADMIN")).thenReturn(1L);

        UserDTO dto = new UserDTO();
        dto.setRole("USER");

        assertThatThrownBy(() -> userService.updateUser(3L, dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("至少需要保留一个");
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateUser_shouldRejectDisablingLastEnabledAdmin() {
        User target = admin(4L, "admin@site.com", true);
        when(userRepository.findById(4L)).thenReturn(Optional.of(target));
        when(userRepository.countByRoleAndEnabledTrue("ADMIN")).thenReturn(1L);

        UserDTO dto = new UserDTO();
        dto.setEnabled(false);

        assertThatThrownBy(() -> userService.updateUser(4L, dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("至少需要保留一个");
        verify(userRepository, never()).save(any());
    }

    @Test
    void createUser_shouldRejectDuplicateUsername() {
        UserDTO dto = new UserDTO();
        dto.setUsername("taken");
        dto.setEmail("new@site.com");
        when(userRepository.existsByUsername("taken")).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(dto))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("用户名已存在");
    }

    @Test
    void createUser_shouldEncodePasswordAndDefaultRole() {
        UserDTO dto = new UserDTO();
        dto.setUsername("bob");
        dto.setEmail("bob@site.com");
        dto.setPassword("plain");
        when(userRepository.existsByUsername("bob")).thenReturn(false);
        when(userRepository.existsByEmail("bob@site.com")).thenReturn(false);
        when(passwordEncoder.encode("plain")).thenReturn("ENCODED");
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserDTO result = userService.createUser(dto);

        assertThat(result.getRole()).isEqualTo("USER");
        verify(passwordEncoder).encode("plain");
        verify(userRepository).save(argThat(u -> "ENCODED".equals(u.getPassword())));
    }
}
