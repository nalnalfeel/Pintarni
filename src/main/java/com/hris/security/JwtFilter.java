package com.hris.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        // 1. Lewati filter untuk file statis (HTML, CSS, JS) dan endpoint Login
        if (!path.startsWith("/api/") || path.startsWith("/api/auth/login")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 2. Ambil token dari header "Authorization"
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Akses ditolak: Token tidak ditemukan.");
            return;
        }

        // 3. Validasi Token
        String token = header.substring(7); // Menghapus kata "Bearer "
        Claims claims = jwtUtil.validateAndGetClaims(token);

        if (claims == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Akses ditolak: Token tidak valid atau kedaluwarsa.");
            return;
        }

        // 4. (Opsional) Simpan data user ke dalam atribut request agar bisa dibaca oleh Controller
        request.setAttribute("username", claims.getSubject());
        request.setAttribute("role", claims.get("role"));

        // Lanjutkan ke endpoint tujuan (Controller)
        filterChain.doFilter(request, response);
    }
}