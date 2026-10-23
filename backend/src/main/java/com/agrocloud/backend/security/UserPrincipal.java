package com.agrocloud.backend.security;

import com.agrocloud.backend.entity.AccountStatus;
import com.agrocloud.backend.entity.User;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public record UserPrincipal(
        UUID id,
        String email,
        String password,
        AccountStatus status,
        boolean emailVerified,
        long authVersion,
        Collection<? extends GrantedAuthority> authorities) implements UserDetails {

    public UserPrincipal(UUID id, String email, String password, AccountStatus status,
            Collection<? extends GrantedAuthority> authorities) {
        this(id, email, password, status, true, 0, authorities);
    }

    public static UserPrincipal from(User user) {
        return new UserPrincipal(
                user.getId(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getStatus(),
                user.isEmailVerified(),
                user.getAuthVersion(),
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public boolean isAccountNonLocked() {
        return status != AccountStatus.SUSPENDIDO;
    }

    @Override
    public boolean isEnabled() {
        return status == AccountStatus.ACTIVO && emailVerified;
    }

    public boolean hasRole(String roleName) {
        String expected = roleName.startsWith("ROLE_") ? roleName : "ROLE_" + roleName;
        return authorities.stream().anyMatch(a -> a.getAuthority().equals(expected));
    }

    public boolean isAdminOrSupport() {
        return hasRole("ADMINISTRADOR") || hasRole("SOPORTE");
    }
}
