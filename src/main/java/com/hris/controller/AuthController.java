package com.hris.controller;

import com.hris.dto.LoginRequest;
import com.hris.pintarni.User;
import com.hris.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Biarkan default, aman untuk development
public class AuthController {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Cek kecocokan password
            if (passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                user.setPassword(null); // Hapus password sebelum dikirim ke frontend
                return ResponseEntity.ok(user);
            }
        }
        return ResponseEntity.status(401).body("Username atau password salah!");
    }
}