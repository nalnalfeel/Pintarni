package com.hris.pintarni;

import jakarta.persistence.Entity;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.boot.persistence.autoconfigure.EntityScan;
import org.springframework.context.event.EventListener;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.awt.Desktop;
import java.net.URI;


@SpringBootApplication(scanBasePackages = "com.hris")
@EnableJpaRepositories(basePackages = "com.hris.repository")
@EntityScan(basePackages = "com.hris.pintarni")
public class PintarniApplication {

    public static void main(String[] args) {
        new SpringApplicationBuilder(PintarniApplication.class)
                .headless(false)
                .run(args);
    }

    @EventListener(ApplicationReadyEvent.class)
    public void openBrowserAfterStartup() {
        try {
            if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
                Desktop.getDesktop().browse(new URI("http://localhost:8080"));
                System.out.println(">> Browser berhasil dibuka otomatis!");
            }
        } catch (Exception e) {
            System.out.println(">> Gagal membuka browser otomatis: " + e.getMessage());
        }
    }
}