package com.hris.config;

import com.hris.pintarni.User;
import com.hris.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataLoader implements CommandLineRunner {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public DataLoader(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // Buat user admin jika database masih kosong
        if (userRepository.count() == 0) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123")); // Password di-hash
            admin.setFullName("Administrator HRD");
            admin.setRole("ADMIN");
            userRepository.save(admin);
            System.out.println(">> User 'admin' berhasil dibuat dengan password 'admin123'");
        }
    }
}