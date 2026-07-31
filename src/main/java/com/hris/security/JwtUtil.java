package com.hris.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    // Secret key statis untuk keperluan development. Di production, gunakan Environment Variable.
    private final Key key = Keys.hmacShaKeyFor("IniAdalahSecretKeyYangSangatPanjangUntukHRISApp2024!".getBytes());

    // Masa berlaku token (contoh: 10 jam)
    private final long expirationMs = 36000000;

    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims validateAndGetClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(key)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return null; // Token tidak valid atau kedaluwarsa
        }
    }
}