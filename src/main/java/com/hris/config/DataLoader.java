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
        // 1. Paksa hapus data lama yang tersangkut
        userRepository.deleteAll();

        // 2. Buat akun admin baru dengan password yang dienkripsi dengan benar
        User admin = new User();
        admin.setUsername("admin");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFullName("Administrator HRD");
        admin.setRole("ADMIN");
        userRepository.save(admin);

        System.out.println(">> Database berhasil di-reset! Password admin adalah admin123");
    }
}