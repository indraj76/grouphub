package com.grouphub.verification;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

/** Checks the X-Admin-Key header. If ADMIN_KEY is unset or shorter than 16 chars, admin access is OFF. */
@Component
public class AdminGuard {

    private final String adminKey;

    public AdminGuard(@Value("${grouphub.admin-key:}") String adminKey) {
        this.adminKey = adminKey;
    }

    public void require(String presented) {
        boolean configured = adminKey != null && adminKey.length() >= 16;
        boolean ok = configured && presented != null && MessageDigest.isEqual(
                adminKey.getBytes(StandardCharsets.UTF_8), presented.getBytes(StandardCharsets.UTF_8));
        if (!ok) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin key required");
    }
}
